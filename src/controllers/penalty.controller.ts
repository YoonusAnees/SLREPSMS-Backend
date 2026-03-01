import { Request, Response } from "express";
import { z } from "zod";
import { issuePenalty, listMyPenalties } from "../services/penalty.service.js";

export async function createPenalty(req: Request, res: Response) {
  const officerUserId = (req as any).user.sub;

 const dto = z.object({
  licenseNo: z.string().min(5).max(30),
  plateNo: z.string().min(4).max(20).optional(),
  violationCode: z.string().min(3).max(50),
  locationText: z.string().min(2).max(200),
  occurredAt: z.string(),
  notes: z.string().optional()
}).parse(req.body);

  res.json(await issuePenalty(officerUserId, dto));
}

export async function myPenalties(req: Request, res: Response) {
  const driverUserId = (req as any).user.sub;
  res.json(await listMyPenalties(driverUserId));
}