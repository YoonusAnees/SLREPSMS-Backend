import { Request, Response } from "express";
import { z } from "zod";
import { addVehicle, listMyVehicles } from "../services/vehicle.service.js";

export async function createVehicle(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    plateNo: z.string().min(4).max(20),
    type: z.string().min(2).max(50)
  }).parse(req.body);

  res.json(await addVehicle(userId, dto));
}

export async function myVehicles(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await listMyVehicles(userId));
}