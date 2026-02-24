import { Request, Response } from "express";
import { z } from "zod";
import { getMyDriverProfile, upsertMyDriverProfile, updateMyProfile } from "../services/driver.service.js";

export async function getMe(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await getMyDriverProfile(userId));
}

export async function upsertMe(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    licenseNo: z.string().min(5).max(30),
    initialPoints: z.number().int().min(0).max(20).optional()
  }).parse(req.body);

  res.json(await upsertMyDriverProfile(userId, dto));
}

export async function updateMeDriver(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(8).max(15).optional(),
    nic: z.string().min(5).max(20).optional()
  }).parse(req.body);

  res.json(await updateMyProfile(userId, dto));
}