import { Request, Response } from "express";
import { z } from "zod";
import {
  getDashboard,
  adminUsers,
  adminPenalties,
  adminPayments,
  adminIncidents,
} from "../services/admin.service.js";

export async function dashboard(req: Request, res: Response) {
  res.json(await getDashboard());
}

export async function listUsers(req: Request, res: Response) {
  const dto = z.object({
    role: z.enum(["DRIVER", "OFFICER", "ADMIN", "DISPATCHER", "RESCUE"]).optional(),
    q: z.string().max(120).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }).parse(req.query);

  res.json(await adminUsers(dto));
}

export async function listPenalties(req: Request, res: Response) {
  const dto = z.object({
    status: z.enum(["UNPAID", "PAID", "CANCELLED"]).optional(),
    q: z.string().max(120).optional(), // plate/license/email
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }).parse(req.query);

  res.json(await adminPenalties(dto));
}

export async function listPayments(req: Request, res: Response) {
  const dto = z.object({
    status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
    q: z.string().max(120).optional(), // receipt/email
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }).parse(req.query);

  res.json(await adminPayments(dto));
}

export async function listIncidents(req: Request, res: Response) {
  const dto = z.object({
    status: z.enum(["NEW", "DISPATCHED", "RESOLVED", "CANCELLED"]).optional(),
    type: z.enum(["ACCIDENT", "BREAKDOWN", "MEDICAL", "FIRE", "OTHER"]).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }).parse(req.query);

  res.json(await adminIncidents(dto));
}