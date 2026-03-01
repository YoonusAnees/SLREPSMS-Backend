import  AppDataSource  from "../config/data-source.js";
import { Dispatch } from "../entities/Dispatch.js";
import { Incident } from "../entities/Incident.js";
import { RescueTeam } from "../entities/RescueTeam.js";
import { User } from "../entities/User.js";

export async function nearestTeams(dto: {
  lat: number;
  lng: number;
  limit?: number;
  maxDistanceMeters?: number;
}) {
  const limit = dto.limit ?? 5;
  const maxDist = dto.maxDistanceMeters ?? 30000; // 30km default

  // ST_Distance on geography returns meters
  return AppDataSource.getRepository(RescueTeam)
    .createQueryBuilder("rt")
    .addSelect(
      `ST_Distance(rt.base_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)`,
      "distance_m"
    )
    .where(`rt.status = 'AVAILABLE'`)
    .andWhere(
      `ST_DWithin(rt.base_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :maxDist)`,
      { lng: dto.lng, lat: dto.lat, maxDist }
    )
    .orderBy("distance_m", "ASC")
    .setParameters({ lng: dto.lng, lat: dto.lat, maxDist })
    .limit(limit)
    .getRawAndEntities()
    .then(({ entities, raw }) =>
      entities.map((t, idx) => ({ ...t, distanceMeters: Number(raw[idx].distance_m) }))
    );
}

export async function dispatchTeam(
  dispatcherUserId: string,
  dto: { incidentId: string; rescueTeamId: string; notes?: string }
) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const iRepo = trx.getRepository(Incident);
    const rtRepo = trx.getRepository(RescueTeam);
    const dRepo = trx.getRepository(Dispatch);

    const dispatcher = await uRepo.findOne({ where: { id: dispatcherUserId } });
    if (!dispatcher || (dispatcher.role !== "ADMIN" && dispatcher.role !== "OFFICER")) {
      throw Object.assign(new Error("Only ADMIN/OFFICER can dispatch"), { status: 403 });
    }

    const incident = await iRepo.findOne({ where: { id: dto.incidentId } });
    if (!incident) throw Object.assign(new Error("Incident not found"), { status: 404 });

    const team = await rtRepo.findOne({ where: { id: dto.rescueTeamId } });
    if (!team) throw Object.assign(new Error("Rescue team not found"), { status: 404 });

    if (team.status !== "AVAILABLE") {
      throw Object.assign(new Error("Rescue team is not available"), { status: 409 });
    }

    const dispatch = dRepo.create({
      incident,
      rescueTeam: team,
      dispatchedBy: dispatcher,
      status: "ASSIGNED",
      notes: dto.notes ?? null,
    });

    const saved = await dRepo.save(dispatch);

    // update statuses
    team.status = "BUSY";
    await rtRepo.save(team);

    incident.status = "DISPATCHED";
    await iRepo.save(incident);

    return dRepo.findOne({
      where: { id: saved.id },
      relations: { incident: true, rescueTeam: true, dispatchedBy: true },
    });
  });
}

export async function updateDispatchStatus(dto: {
  dispatchId: string;
  status: "EN_ROUTE" | "ON_SCENE" | "COMPLETED" | "CANCELLED";
}) {
  return AppDataSource.transaction(async (trx) => {
    const dRepo = trx.getRepository(Dispatch);
    const rtRepo = trx.getRepository(RescueTeam);
    const iRepo = trx.getRepository(Incident);

    const dispatch = await dRepo.findOne({
      where: { id: dto.dispatchId },
      relations: { rescueTeam: true, incident: true },
    });

    if (!dispatch) throw Object.assign(new Error("Dispatch not found"), { status: 404 });

    dispatch.status = dto.status;
    await dRepo.save(dispatch);

    // if completed/cancelled: set team available again
    if (dto.status === "COMPLETED" || dto.status === "CANCELLED") {
      dispatch.rescueTeam.status = "AVAILABLE";
      await rtRepo.save(dispatch.rescueTeam);

      // check if incident can be resolved (all dispatches completed/cancelled)
      const all = await dRepo.find({ where: { incident: { id: dispatch.incident.id } } });
      const done = all.every(x => x.status === "COMPLETED" || x.status === "CANCELLED");
      if (done) {
        dispatch.incident.status = "RESOLVED";
        await iRepo.save(dispatch.incident);
      }
    }

    return dRepo.findOne({
      where: { id: dispatch.id },
      relations: { incident: true, rescueTeam: true },
    });
  });
}