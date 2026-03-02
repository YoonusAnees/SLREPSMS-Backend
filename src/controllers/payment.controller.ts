import { Request, Response } from "express";
import { z } from "zod";
import { createStripeIntent, confirmStripeDemo, myPayments } from "../services/payment.service.js";

export async function stripeCreateIntent(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    penaltyId: z.string().uuid(),
    idempotencyKey: z.string().min(8).max(80),
  }).parse(req.body);

  const payment = await createStripeIntent(userId, dto);

  res.json({
    paymentId: payment.id,
    clientSecret: payment.stripeClientSecret,
    amountLkr: payment.amountLkr,
    receiptNo: payment.receiptNo,
  });
}

export async function stripeConfirmDemo(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    paymentId: z.string().uuid(),
  }).parse(req.body);

  res.json(await confirmStripeDemo(userId, dto));
}

export async function mine(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await myPayments(userId));
}