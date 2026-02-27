import { Request, Response } from "express";
import { z } from "zod";
import { createViolationType, listViolationTypes , bulkCreateViolationTypes } from "../services/violationType.service.js";

export async function create(req: Request, res: Response) {
  const dto = z.object({
    code: z.string().min(3).max(50),
    title: z.string().min(3).max(120),
    baseFineLkr: z.number().int().min(0),
    demeritPoints: z.number().int().min(0).max(20),
    description: z.string().optional()
  }).parse(req.body);

  res.json(await createViolationType(dto));
}

export async function list(req: Request, res: Response) {
  res.json(await listViolationTypes());
}


export async function bulkCreate(req: any, res: any) {
  const schema = z.array(z.object({
    code: z.string().min(3).max(50),
    title: z.string().min(3).max(120),
    baseFineLkr: z.number().int().min(0),
    demeritPoints: z.number().int().min(0).max(20),
    description: z.string().optional()
  }));

  const items = schema.parse(req.body);

  const saved = await bulkCreateViolationTypes(items);

  res.json({ created: saved.length, items: saved });
}

