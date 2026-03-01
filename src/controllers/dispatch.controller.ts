import { Request, Response } from "express";
import { z } from "zod";
import { dispatchTeam, nearestTeams, updateDispatchStatus } from "../services/dispatch.service.js";

export async function nearest(req: Request, res: Response) {
  const dto = z.object({
    lat: z.number(),
    lng: z.number(),
    limit: z.number().int().min(1).max(20).optional(),
    maxDistanceMeters: z.number().int().min(1000).max(200000).optional(),
  }).parse(req.body);

  res.json(await nearestTeams(dto));
}

export async function dispatch(req: Request, res: Response) {
  const userId = (req as any).user.sub;

  const dto = z.object({
    incidentId: z.string().uuid(),
    rescueTeamId: z.string().uuid(),
    notes: z.string().optional(),
  }).parse(req.body);

  res.json(await dispatchTeam(userId, dto));
}

export async function updateStatus(req: Request, res: Response) {
  const dto = z.object({
    dispatchId: z.string().uuid(),
    status: z.enum(["EN_ROUTE", "ON_SCENE", "COMPLETED", "CANCELLED"]),
  }).parse(req.body);

  res.json(await updateDispatchStatus(dto));
}