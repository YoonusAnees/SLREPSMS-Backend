import { Request, Response } from "express";
import { z } from "zod";
import { registerRescue } from "../services/rescue-auth.service.js";

export async function register(req: Request, res: Response) {
  const dto = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    teamCode: z.string().min(3).max(30),
    phone: z.string().optional(),
    baseLat: z.number(),
    baseLng: z.number(),
    baseLocationText: z.string().optional(),
  }).parse(req.body);

  res.status(201).json(await registerRescue(dto));
}