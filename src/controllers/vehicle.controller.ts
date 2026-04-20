import { Request, Response } from "express";
import { z } from "zod";
import {
  addVehicle,
  listMyVehicles,
  verifyVehicleOwnership,
  getVehicleByPlateNo,
} from "../services/vehicle.service.js";

export async function createVehicle(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    plateNo: z.string().min(4).max(20),
    type: z.string().min(2).max(50),
    model: z.string().min(1).max(50).optional(),
    color: z.string().min(1).max(30).optional(),
    year: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
    insuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).parse(req.body);

  res.json(await addVehicle(userId, dto));
}

export async function myVehicles(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await listMyVehicles(userId));
}

export async function verifyVehicle(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  const raw = req.params.plateNo;

  if (typeof raw !== "string" || raw.trim().length === 0) {
    return res.status(400).json({ message: "Invalid plateNo" });
  }

  const updated = await verifyVehicleOwnership(userId, raw);
  res.json(updated);
}

export async function getByPlateNo(req: Request, res: Response) {
  const raw = req.params.plateNo;

  if (typeof raw !== "string" || raw.trim().length === 0) {
    return res.status(400).json({ message: "Invalid plateNo" });
  }

  const vehicle = await getVehicleByPlateNo(raw);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  res.json(vehicle);
}