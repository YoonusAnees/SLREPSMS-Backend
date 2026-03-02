import AppDataSource  from "../config/data-source.js";
import { Payment } from "../entities/Payment.js";
import { Penalty } from "../entities/Penalty.js";
import { User } from "../entities/User.js";
import { makeReceiptNo } from "../utils/receipt.js";
import { stripe } from "../utils/stripe.js";

function toStripeAmountLkr(fineLkr: number) {
  // demo: treat fineLkr as rupees integer, Stripe needs smallest unit => *100
  return fineLkr * 100;
}

export async function createStripeIntent(
  driverUserId: string,
  dto: { penaltyId: string; idempotencyKey: string }
) {
  return AppDataSource.transaction(async (trx) => {
    const penaltyRepo = trx.getRepository(Penalty);
    const payRepo = trx.getRepository(Payment);
    const userRepo = trx.getRepository(User);

    const user = await userRepo.findOne({ where: { id: driverUserId } });
    if (!user || user.role !== "DRIVER") {
      throw Object.assign(new Error("Only DRIVER can pay"), { status: 403 });
    }

    // Idempotency (your DB)
    const existingByKey = await payRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingByKey) return existingByKey;

    const penalty = await penaltyRepo.findOne({
      where: { id: dto.penaltyId },
      relations: { driverUser: true, violationType: true, vehicle: true },
    });
    if (!penalty) throw Object.assign(new Error("Penalty not found"), { status: 404 });

    if (penalty.driverUser.id !== driverUserId) {
      throw Object.assign(new Error("Not allowed"), { status: 403 });
    }

    if (penalty.status === "PAID") {
      throw Object.assign(new Error("Penalty already PAID"), { status: 409 });
    }

    // Optional: if a payment already exists for this penalty, reuse it
    const existingForPenalty = await payRepo.findOne({
      where: { penalty: { id: penalty.id } } as any,
    });
    if (existingForPenalty?.stripeClientSecret) return existingForPenalty;

    const payment = payRepo.create({
      penalty,
      paidBy: user,
      receiptNo: makeReceiptNo(),
      amountLkr: penalty.fineLkr,
      method: "CARD",
      gateway: "STRIPE",
      gatewayRef: null,
      status: "PENDING",
      idempotencyKey: dto.idempotencyKey,
      stripePaymentIntentId: null,
      stripeClientSecret: null,
    });

    const saved = await payRepo.save(payment);

    const pi = await stripe.paymentIntents.create(
      {
        amount: toStripeAmountLkr(penalty.fineLkr),
        currency: (process.env.STRIPE_CURRENCY || "lkr").toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          paymentId: saved.id,
          penaltyId: penalty.id,
          driverUserId,
          receiptNo: saved.receiptNo,
        },
      },
      { idempotencyKey: dto.idempotencyKey } // Stripe idempotency
    );

    saved.stripePaymentIntentId = pi.id;
    saved.stripeClientSecret = pi.client_secret ?? null;
    saved.gatewayRef = pi.id;

    await payRepo.save(saved);

    return saved;
  });
}

/**
 * STEP 2 (DEMO): Frontend confirms card, then calls this endpoint.
 * We trust the client and mark SUCCESS + PAID.
 */
export async function confirmStripeDemo(driverUserId: string, dto: { paymentId: string }) {
  return AppDataSource.transaction(async (trx) => {
    const payRepo = trx.getRepository(Payment);
    const penaltyRepo = trx.getRepository(Penalty);

    const payment = await payRepo.findOne({
      where: { id: dto.paymentId },
      relations: { paidBy: true, penalty: true },
    });

    if (!payment) throw Object.assign(new Error("Payment not found"), { status: 404 });

    // Only owner driver can confirm
    if (payment.paidBy.id !== driverUserId) {
      throw Object.assign(new Error("Not allowed"), { status: 403 });
    }

    if (payment.status === "SUCCESS") return payment;

    // Optional: verify with Stripe (still no webhook)
    if (payment.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      if (pi.status !== "succeeded") {
        throw Object.assign(new Error("Stripe payment not succeeded yet"), { status: 409 });
      }
    }

    payment.status = "SUCCESS";
    await payRepo.save(payment);

    if (payment.penalty.status !== "PAID") {
      payment.penalty.status = "PAID";
      await penaltyRepo.save(payment.penalty);
    }

    return payment;
  });
}

export async function myPayments(driverUserId: string) {
  return AppDataSource.getRepository(Payment).find({
    where: { paidBy: { id: driverUserId } } as any,
    relations: { penalty: { violationType: true, vehicle: true } } as any,
    order: { paidAt: "DESC" } as any,
  });
}