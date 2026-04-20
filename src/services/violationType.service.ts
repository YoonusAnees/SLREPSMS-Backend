import  AppDataSource  from "../config/data-source.js";
import { ViolationType } from "../entities/ViolationType.js";

export async function createViolationType(dto: {
  code: string; title: string; baseFineLkr: number; demeritPoints: number; description?: string;
}) {
  const repo = AppDataSource.getRepository(ViolationType);
  const row = repo.create(dto);
  return repo.save(row);
}

export async function listViolationTypes() {
  return AppDataSource.getRepository(ViolationType).find({ order: { code: "ASC" } });
}


export async function bulkCreateViolationTypes(items: {
  code: string;
  title: string;
  baseFineLkr: number;
  demeritPoints: number;
  description?: string;
}[]) {
  const repo = AppDataSource.getRepository(ViolationType);

  const rows = items.map(i => repo.create(i));
  return repo.save(rows);
}