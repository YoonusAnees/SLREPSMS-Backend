import { Request, Response } from "express";
import { z } from "zod";
import { createIncident, listIncidents } from "../services/incident.service.js";

export async function create(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    type: z.enum(["ACCIDENT", "BREAKDOWN", "MEDICAL", "FIRE", "OTHER"]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional(),
    locationText: z.string().optional(),
    evidence: z.string().optional(), 
  }).parse(req.body);

  res.json(await createIncident(userId, dto));
}

export async function list(req: Request, res: Response) {
  res.json(await listIncidents());
}