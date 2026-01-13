import { Request, Response } from "express";
import { z } from "zod";
import { registerUser, login, refresh } from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const dto = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["DRIVER", "OFFICER", "ADMIN", "DISPATCHER", "RESCUE"]),
    password: z.string().min(8),
    phone: z.string().optional(),
    nic: z.string().optional()
  }).parse(req.body);

  const u = await registerUser(dto);
  res.json({ id: u.id, email: u.email, role: u.role });
}

export async function loginCtrl(req: Request, res: Response) {
  const dto = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }).parse(req.body);

  res.json(await login(dto.email, dto.password));
}

export async function refreshCtrl(req: Request, res: Response) {
  const dto = z.object({ refreshToken: z.string().min(10) }).parse(req.body);
  res.json(await refresh(dto.refreshToken));
}
