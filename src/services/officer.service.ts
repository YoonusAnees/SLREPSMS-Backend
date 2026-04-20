import AppDataSource from "../config/data-source.js";
import { User } from "../entities/User.js";
import { Penalty } from "../entities/Penalty.js";
import { Vehicle } from "../entities/Vehicle.js";
import { Incident } from "../entities/Incident.js";

export async function getMyOfficerDashboard(officerUserId: string) {
  const uRepo = AppDataSource.getRepository(User);
  const pRepo = AppDataSource.getRepository(Penalty);
  const vRepo = AppDataSource.getRepository(Vehicle);
  const iRepo = AppDataSource.getRepository(Incident);

  const officer = await uRepo.findOne({ where: { id: officerUserId } });

  if (!officer || officer.role !== "OFFICER") {
    throw Object.assign(new Error("Only OFFICER can access dashboard"), { status: 403 });
  }

  const [
    issuedPenalties,
    verifiedVehicles,
    reviewedIncidents,
    resolvedIncidents,
    unpaidIssuedPenalties,
    paidIssuedPenalties,
    highSeverityOpenIncidents,
    recentIssuedPenalties,
    recentVerifiedVehicles,
    recentResolvedIncidents,
  ] = await Promise.all([
    pRepo.count({ where: { issuedBy: { id: officerUserId } } }),
    vRepo.count({
      where: {
        verifiedBy: { id: officerUserId },
        ownershipVerified: true,
      },
    }),
    iRepo.count({ where: { reviewedBy: { id: officerUserId } } }),
    iRepo.count({
      where: {
        resolvedBy: { id: officerUserId },
        status: "RESOLVED",
      },
    }),
    pRepo.count({
      where: {
        issuedBy: { id: officerUserId },
        status: "UNPAID",
      },
    }),
    pRepo.count({
      where: {
        issuedBy: { id: officerUserId },
        status: "PAID",
      },
    }),
    iRepo
      .createQueryBuilder("i")
      .where("i.status IN (:...statuses)", {
        statuses: ["NEW", "UNDER_REVIEW", "DISPATCHED"],
      })
      .andWhere("i.severity IN (:...severities)", {
        severities: ["HIGH", "CRITICAL"],
      })
      .getCount(),
    pRepo.find({
      where: { issuedBy: { id: officerUserId } },
      relations: { violationType: true, driverUser: true, vehicle: true, issuedBy: true },
      order: { occurredAt: "DESC" },
      take: 5,
    }),
    vRepo.find({
      where: { verifiedBy: { id: officerUserId } },
      relations: { driver: { user: true }, verifiedBy: true },
      order: { verifiedAt: "DESC" as any },
      take: 5,
    }),
    iRepo.find({
      where: {
        resolvedBy: { id: officerUserId },
        status: "RESOLVED",
      },
      relations: { reportedBy: true, resolvedBy: true, reviewedBy: true },
      order: { resolvedAt: "DESC" as any },
      take: 5,
    }),
  ]);

  return {
    officer: {
      id: officer.id,
      name: officer.name,
      email: officer.email,
      role: officer.role,
    },
    stats: {
      issuedPenalties,
      verifiedVehicles,
      reviewedIncidents,
      resolvedIncidents,
      unpaidIssuedPenalties,
      paidIssuedPenalties,
      highSeverityOpenIncidents,
    },
    recentIssuedPenalties,
    recentVerifiedVehicles,
    recentResolvedIncidents,
  };
}