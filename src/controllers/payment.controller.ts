import { Request, Response } from "express";
import { z } from "zod";
import { payPenalty, myPayments } from "../services/payment.service.js";

export async function pay(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    penaltyId: z.string().uuid(),
    method: z.string().min(2).max(30),
    idempotencyKey: z.string().min(8).max(80),
    gateway: z.string().max(30).optional(),
    gatewayRef: z.string().max(80).optional(),
  }).parse(req.body);

  res.json(await payPenalty(userId, dto));
}

export async function mine(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await myPayments(userId));
}