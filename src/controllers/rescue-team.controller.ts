import { Request, Response } from "express";
import { z } from "zod";
import { getMyRescueTeam, updateMyRescueTeam } from "../services/rescue-team.service.js";

export async function me(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await getMyRescueTeam(userId));
}

export async function updateMe(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]).optional(),
    phone: z.string().optional(),
    baseLat: z.number().optional(),
    baseLng: z.number().optional(),
    baseLocationText: z.string().optional(),
  }).parse(req.body);

  res.json(await updateMyRescueTeam(userId, dto));
}