import AppDataSource  from "../config/data-source.js";
import { Payment } from "../entities/Payment.js";
import { Penalty } from "../entities/Penalty.js";
import { User } from "../entities/User.js";
import { makeReceiptNo } from "../utils/receipt.js";

export async function payPenalty(
  driverUserId: string,
  dto: {
    penaltyId: string;
    method: string; // CARD / LANKAQR / STRIPE_TEST / etc
    idempotencyKey: string; // UUID recommended from client/Postman
    gateway?: string;        // SIMULATED / STRIPE
    gatewayRef?: string;     // from gateway if any
  }
) {
  return AppDataSource.transaction(async (trx) => {
    const penaltyRepo = trx.getRepository(Penalty);
    const payRepo = trx.getRepository(Payment);
    const userRepo = trx.getRepository(User);

    const user = await userRepo.findOne({ where: { id: driverUserId } });
    if (!user || user.role !== "DRIVER") {
      throw Object.assign(new Error("Only DRIVER can pay"), { status: 403 });
    }

    // idempotency: if same key was used, return previous result
    const existingByKey = await payRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
      relations: { penalty: true },
    });
    if (existingByKey) return existingByKey;

    const penalty = await penaltyRepo.findOne({
      where: { id: dto.penaltyId },
      relations: { driverUser: true, violationType: true, vehicle: true },
    });

    if (!penalty) throw Object.assign(new Error("Penalty not found"), { status: 404 });

    // ownership: driver can pay only their penalties
    if (penalty.driverUser.id !== driverUserId) {
      throw Object.assign(new Error("Not allowed to pay this penalty"), { status: 403 });
    }

    if (penalty.status === "PAID") {
      throw Object.assign(new Error("Penalty already PAID"), { status: 409 });
    }

    // make payment record (simulate gateway success)
    const payment = payRepo.create({
      penalty,
      paidBy: user,
      receiptNo: makeReceiptNo(),
      amountLkr: penalty.fineLkr,
      method: dto.method,
      gateway: dto.gateway ?? "SIMULATED",
      gatewayRef: dto.gatewayRef ?? null,
      status: "SUCCESS",
      idempotencyKey: dto.idempotencyKey,
    });

    const savedPayment = await payRepo.save(payment);

    // mark penalty as PAID
    penalty.status = "PAID";
    await penaltyRepo.save(penalty);

    // return full payment details
    const full = await payRepo.findOne({
      where: { id: savedPayment.id },
      relations: { penalty: { violationType: true, vehicle: true }, paidBy: true },
    });

    return full ?? savedPayment;
  });
}

export async function myPayments(driverUserId: string) {
  return AppDataSource.getRepository(Payment).find({
    where: { paidBy: { id: driverUserId } },
    relations: { penalty: { violationType: true, vehicle: true } },
    order: { paidAt: "DESC" },
  });
}