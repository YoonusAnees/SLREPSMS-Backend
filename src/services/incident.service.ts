import  AppDataSource  from "../config/data-source.js";
import { Incident } from "../entities/Incident.js";
import { User } from "../entities/User.js";
import { pointGeoJSON } from "../utils/geo.js";

export async function createIncident(userId: string, dto: {
  type: "ACCIDENT" | "BREAKDOWN" | "MEDICAL" | "FIRE" | "OTHER";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lat: number;
  lng: number;
  description?: string | null;
  locationText?: string | null;
  evidence?: string | null;
}) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const iRepo = trx.getRepository(Incident);

    const user = await uRepo.findOne({ where: { id: userId } });
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

    const incident = iRepo.create({
      reportedBy: user,
      type: dto.type,
      severity: dto.severity,
      status: "NEW",
      description: dto.description ?? null,
      locationText: dto.locationText ?? null,
      evidence: dto.evidence ?? null,
      baseLocation:pointGeoJSON(dto.lng, dto.lat),
    });

    return iRepo.save(incident);
  });
}

export async function listIncidents() {
  return AppDataSource.getRepository(Incident).find({
    relations: { reportedBy: true, dispatches: true },
    order: { createdAt: "DESC" },
  });
}