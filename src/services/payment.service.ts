import AppDataSource from "../config/data-source.js";
import { Payment } from "../entities/Payment.js";
import { Penalty } from "../entities/Penalty.js";
import { User } from "../entities/User.js";
import { makeReceiptNo } from "../utils/receipt.js";
import { stripe } from "../utils/stripe.js";

function toStripeAmountLkr(fineLkr: number) {
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

    const existingByKey = await payRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingByKey) return existingByKey;

    const penalty = await penaltyRepo.findOne({
      where: { id: dto.penaltyId },
      relations: { driverUser: true, violationType: true, vehicle: true },
    });
    if (!penalty) {
      throw Object.assign(new Error("Penalty not found"), { status: 404 });
    }

    if (penalty.driverUser.id !== driverUserId) {
      throw Object.assign(new Error("Not allowed"), { status: 403 });
    }

    if (penalty.status === "PAID") {
      throw Object.assign(new Error("Penalty already PAID"), { status: 409 });
    }

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
      { idempotencyKey: dto.idempotencyKey }
    );

    saved.stripePaymentIntentId = pi.id;
    saved.stripeClientSecret = pi.client_secret ?? null;
    saved.gatewayRef = pi.id;

    await payRepo.save(saved);

    return saved;
  });
}

/**
 * NEW: Hosted Checkout for Expo / React Native redirect flow
 */
export async function createStripeCheckout(
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

    const existingByKey = await payRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingByKey?.gatewayRef) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingByKey.gatewayRef
      );

      return {
        payment: existingByKey,
        checkoutUrl: existingSession.url,
      };
    }

    const penalty = await penaltyRepo.findOne({
      where: { id: dto.penaltyId },
      relations: { driverUser: true, violationType: true, vehicle: true },
    });
    if (!penalty) {
      throw Object.assign(new Error("Penalty not found"), { status: 404 });
    }

    if (penalty.driverUser.id !== driverUserId) {
      throw Object.assign(new Error("Not allowed"), { status: 403 });
    }

    if (penalty.status === "PAID") {
      throw Object.assign(new Error("Penalty already PAID"), { status: 409 });
    }

    const existingForPenalty = await payRepo.findOne({
      where: { penalty: { id: penalty.id } } as any,
    });

    if (existingForPenalty?.gatewayRef) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingForPenalty.gatewayRef
      );

      return {
        payment: existingForPenalty,
        checkoutUrl: existingSession.url,
      };
    }

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

    const webBase = process.env.WEB_APP_BASE_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: `${webBase}/payment-success?paymentId=${saved.id}`,
        cancel_url: `${webBase}/payment-cancel?paymentId=${saved.id}`,
        client_reference_id: saved.id,
        metadata: {
          paymentId: saved.id,
          penaltyId: penalty.id,
          driverUserId,
          receiptNo: saved.receiptNo,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: (process.env.STRIPE_CURRENCY || "lkr").toLowerCase(),
              unit_amount: toStripeAmountLkr(penalty.fineLkr),
              product_data: {
                name: `Traffic Penalty - ${penalty.violationType?.title || "Violation"}`,
                description: `Penalty ID: ${penalty.id}`,
              },
            },
          },
        ],
      },
      { idempotencyKey: dto.idempotencyKey }
    );

    saved.gatewayRef = session.id;
    await payRepo.save(saved);

    return {
      payment: saved,
      checkoutUrl: session.url,
    };
  });
}

/**
 * Called from your web success page after Stripe redirects back
 */
export async function confirmStripeCheckoutSuccess(paymentId: string) {
  return AppDataSource.transaction(async (trx) => {
    const payRepo = trx.getRepository(Payment);
    const penaltyRepo = trx.getRepository(Penalty);

    const payment = await payRepo.findOne({
      where: { id: paymentId },
      relations: { penalty: true },
    });

    if (!payment) {
      throw Object.assign(new Error("Payment not found"), { status: 404 });
    }

    if (!payment.gatewayRef) {
      throw Object.assign(new Error("Checkout session not found"), { status: 404 });
    }

    const session = await stripe.checkout.sessions.retrieve(payment.gatewayRef);

    if (session.payment_status !== "paid") {
      throw Object.assign(new Error("Stripe checkout not paid yet"), { status: 409 });
    }

    if (payment.status !== "SUCCESS") {
      payment.status = "SUCCESS";
      payment.paidAt = new Date();
      await payRepo.save(payment);
    }

    if (payment.penalty.status !== "PAID") {
      payment.penalty.status = "PAID";
      await penaltyRepo.save(payment.penalty);
    }

    return payment;
  });
}

export async function confirmStripeDemo(
  driverUserId: string,
  dto: { paymentId: string }
) {
  return AppDataSource.transaction(async (trx) => {
    const payRepo = trx.getRepository(Payment);
    const penaltyRepo = trx.getRepository(Penalty);

    const payment = await payRepo.findOne({
      where: { id: dto.paymentId },
      relations: { paidBy: true, penalty: true },
    });

    if (!payment) {
      throw Object.assign(new Error("Payment not found"), { status: 404 });
    }

    if (payment.paidBy.id !== driverUserId) {
      throw Object.assign(new Error("Not allowed"), { status: 403 });
    }

    if (payment.status === "SUCCESS") return payment;

    if (payment.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      if (pi.status !== "succeeded") {
        throw Object.assign(new Error("Stripe payment not succeeded yet"), {
          status: 409,
        });
      }
    }

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
    await payRepo.save(payment);

    if (payment.penalty.status !== "PAID") {
      payment.penalty.status = "PAID";
      await penaltyRepo.save(payment.penalty);
    }

    return payment;
  });
}

export async function myPayments(driverUserId: string) {
  const payments = await AppDataSource.getRepository(Payment).find({
    where: { paidBy: { id: driverUserId } } as any,
    relations: {
      penalty: {
        violationType: true,
        vehicle: true,
        driverUser: true,
        issuedBy: true,
      },
    } as any,
    order: { paidAt: "DESC" } as any,
  });

  return payments.map((p) => ({
    id: p.id,
    receiptNo: p.receiptNo,
    amountLkr: p.amountLkr,
    status: p.status,
    paidAt: p.paidAt,
    updatedAt: p.updatedAt,
    officerName: p.penalty?.issuedBy?.name || p.penalty?.issuedBy?.email,
    violationCode: p.penalty?.violationType?.code,
    vehiclePlate: p.penalty?.vehicle?.plateNo,
  }));
}