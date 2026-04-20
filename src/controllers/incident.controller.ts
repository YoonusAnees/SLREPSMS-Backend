import { Request, Response } from "express";
import { z } from "zod";
import {
  createIncident,
  listIncidents,
  listMyIncidents,
  reviewIncident,
  resolveIncident,
} from "../services/incident.service.js";

export async function create(req: Request, res: Response) {
  const userId = (req as any).user?.sub ?? null;

  const dto = z.object({
    type: z.enum(["ACCIDENT", "BREAKDOWN", "MEDICAL", "FIRE", "OTHER"]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional(),
    locationText: z.string().optional(),
    evidence: z.string().optional(),
    plateNo: z.string().min(4).max(20).optional(),
    suspectedViolationCode: z.string().min(3).max(50).optional(),
  }).parse(req.body);

  res.json(await createIncident(userId, dto));
}

export async function list(req: Request, res: Response) {
  res.json(await listIncidents());
}

export async function my(req: Request, res: Response) {
  const userId = (req as any).user.sub;
  res.json(await listMyIncidents(userId));
}

export async function review(req: Request, res: Response) {
  const officerUserId = (req as any).user.sub;
  const incidentId = z.string().uuid().parse(req.params.id);
  res.json(await reviewIncident(officerUserId, incidentId));
}

export async function resolve(req: Request, res: Response) {
  const officerUserId = (req as any).user.sub;
  const incidentId = z.string().uuid().parse(req.params.id);
  res.json(await resolveIncident(officerUserId, incidentId));
}