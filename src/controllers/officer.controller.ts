import { Request, Response } from "express";
import { getMyOfficerDashboard } from "../services/officer.service.js";

export async function myDashboard(req: Request, res: Response) {
  const officerUserId = (req as any).user.sub;
  res.json(await getMyOfficerDashboard(officerUserId));
}