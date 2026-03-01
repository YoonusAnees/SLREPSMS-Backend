import AppDataSource from "../config/data-source.js";
import { RescueTeam } from "../entities/RescueTeam.js";
import { pointWkt } from "../utils/geo.js";

export async function getMyRescueTeam(userId: string) {
  return AppDataSource.getRepository(RescueTeam).findOne({
    where: { user: { id: userId } },
    relations: { user: true },
  });
}

export async function updateMyRescueTeam(userId: string, dto: {
  status?: "AVAILABLE" | "BUSY" | "OFFLINE";
  phone?: string;
  baseLat?: number;
  baseLng?: number;
  baseLocationText?: string;
}) {
  return AppDataSource.transaction(async (trx) => {
    const rtRepo = trx.getRepository(RescueTeam);

    const team = await rtRepo.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!team) throw Object.assign(new Error("Rescue team profile not found"), { status: 404 });

    if (dto.status) team.status = dto.status;
    if (dto.phone !== undefined) team.phone = dto.phone ?? null;

    if (dto.baseLat !== undefined && dto.baseLng !== undefined) {
      team.baseLocation = pointWkt(dto.baseLng, dto.baseLat);
    }

    if (dto.baseLocationText !== undefined) {
      team.baseLocationText = dto.baseLocationText ?? null;
    }

    return rtRepo.save(team);
  });
}