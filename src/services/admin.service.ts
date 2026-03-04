import AppDataSource from "../config/data-source.js";
import { User } from "../entities/User.js";
import { Driver } from "../entities/Driver.js";
import { Penalty } from "../entities/Penalty.js";
import { Payment } from "../entities/Payment.js";
import { ViolationType } from "../entities/ViolationType.js";
import { Incident } from "../entities/Incident.js";
import { RescueTeam } from "../entities/RescueTeam.js";

function ilike(q: string) {
  // sanitize simple wildcard input
  const cleaned = q.replace(/%/g, "").trim();
  return `%${cleaned}%`;
}



export async function getDashboard() {
  const userRepo = AppDataSource.getRepository(User);
  const driverRepo = AppDataSource.getRepository(Driver);
  const penaltyRepo = AppDataSource.getRepository(Penalty);
  const paymentRepo = AppDataSource.getRepository(Payment);
  const incidentRepo = AppDataSource.getRepository(Incident);
  const rescueRepo = AppDataSource.getRepository(RescueTeam);

  // ---- KPI COUNTS ----
  const [
    totalUsers,
    totalDrivers,
    totalPenalties,
    totalPayments,
    revenueRow,
    totalOfficers,
    totalAdmins,
    totalDispatchers,
    totalRescue,
    openIncidents,
    activeRescueTeams,
  ] = await Promise.all([
    userRepo.count(),
    driverRepo.count(),
    penaltyRepo.count(),
    paymentRepo.count({ where: { status: "SUCCESS" } as any }),

    // revenue SUM
    paymentRepo
      .createQueryBuilder("pay")
      .select("COALESCE(SUM(pay.amount_lkr),0)::int", "revenueLkr")
      .where("pay.status = :s", { s: "SUCCESS" })
      .getRawOne(),

    // role counts
    userRepo.count({ where: { role: "OFFICER" } as any }),
    userRepo.count({ where: { role: "ADMIN" } as any }),
    userRepo.count({ where: { role: "DISPATCHER" } as any }),
    userRepo.count({ where: { role: "RESCUE" } as any }),

    // open incidents
    incidentRepo
      .createQueryBuilder("i")
      .where("i.status IN (:...s)", { s: ["NEW", "DISPATCHED"] })
      .getCount(),

    // active rescue teams
    rescueRepo
      .createQueryBuilder("rt")
      .where("rt.status = :s", { s: "AVAILABLE" })
      .getCount(),
  ]);

  const revenueLkr = Number(revenueRow?.revenueLkr || 0);

  // ---- CHARTS ----

  // penalty split PAID/UNPAID/CANCELLED -> FE wants {name,value}
  const penaltySplitRaw = await penaltyRepo
    .createQueryBuilder("p")
    .select("p.status", "name")
    .addSelect("COUNT(*)::int", "value")
    .groupBy("p.status")
    .orderBy("p.status", "ASC")
    .getRawMany();

  // top violations
  const topViolations = await penaltyRepo
    .createQueryBuilder("p")
    .leftJoin("p.violationType", "vt")
    .select("vt.code", "code")
    .addSelect("COUNT(*)::int", "count")
    .groupBy("vt.code")
    .orderBy("count", "DESC")
    .limit(8)
    .getRawMany();

  // incidents by severity
  const incidentsBySeverity = await incidentRepo
    .createQueryBuilder("i")
    .select("i.severity", "severity")
    .addSelect("COUNT(*)::int", "count")
    .groupBy("i.severity")
    .orderBy("count", "DESC")
    .getRawMany();

  // revenue daily (last 14 days)
  const revenueDaily = await paymentRepo
    .createQueryBuilder("pay")
    .select("TO_CHAR(pay.paid_at::date, 'YYYY-MM-DD')", "day")
    .addSelect("COALESCE(SUM(pay.amount_lkr),0)::int", "amountLkr")
    .where("pay.status = :s", { s: "SUCCESS" })
    .andWhere("pay.paid_at >= NOW() - INTERVAL '14 days'")
    .groupBy("pay.paid_at::date")
    .orderBy("day", "ASC")
    .getRawMany();

  // role counts (FE wants [{role,count}])
  const roleCounts = await userRepo
    .createQueryBuilder("u")
    .select("u.role", "role")
    .addSelect("COUNT(*)::int", "count")
    .groupBy("u.role")
    .orderBy("u.role", "ASC")
    .getRawMany();

  // Ensure FE always gets PAID/UNPAID (even if missing)
  const penaltySplit = [
    { name: "PAID", value: 0 },
    { name: "UNPAID", value: 0 },
    { name: "CANCELLED", value: 0 },
  ].map((x) => {
    const found = penaltySplitRaw.find((r) => r.name === x.name);
    return found ? found : x;
  });

  return {
    kpi: {
      totalUsers,
      totalPenalties,
      totalPayments,
      revenueLkr,

      totalDrivers,
      totalOfficers,
      totalDispatchers,
      totalRescue,
      totalAdmins,

      openIncidents,
      activeRescueTeams,
    },
    charts: {
      revenueDaily,
      penaltySplit,
      topViolations,
      incidentsBySeverity,
      roleCounts,
    },
  };
}

export async function adminUsers(dto: {
  role?: string;
  q?: string;
  page: number;
  limit: number;
}) {
  const repo = AppDataSource.getRepository(User);
  const qb = repo.createQueryBuilder("u");

  if (dto.role) qb.andWhere("u.role = :role", { role: dto.role });

  if (dto.q && dto.q.trim()) {
    const q = ilike(dto.q);
    qb.andWhere(
      "(u.name ILIKE :q OR u.email ILIKE :q OR u.phone ILIKE :q OR u.nic ILIKE :q)",
      { q }
    );
  }

  qb.orderBy("u.createdAt", "DESC")
    .skip((dto.page - 1) * dto.limit)
    .take(dto.limit);

  const [rows, total] = await qb.getManyAndCount();

  return {
    page: dto.page,
    limit: dto.limit,
    total,
    rows,
  };
}

export async function adminPenalties(dto: {
  status?: string;
  q?: string;
  page: number;
  limit: number;
}) {
  const repo = AppDataSource.getRepository(Penalty);

  const qb = repo
    .createQueryBuilder("p")
    .leftJoinAndSelect("p.vehicle", "v")
    .leftJoinAndSelect("p.driverUser", "driverUser")
    .leftJoinAndSelect("p.issuedBy", "officer")
    .leftJoinAndSelect("p.violationType", "vt");

  if (dto.status) qb.andWhere("p.status = :status", { status: dto.status });

  if (dto.q && dto.q.trim()) {
    const q = ilike(dto.q);
    qb.andWhere(
      "(v.plateNo ILIKE :q OR driverUser.email ILIKE :q OR officer.email ILIKE :q OR vt.code ILIKE :q)",
      { q }
    );
  }

  qb.orderBy("p.occurredAt", "DESC")
    .skip((dto.page - 1) * dto.limit)
    .take(dto.limit);

  const [rows, total] = await qb.getManyAndCount();

  return {
    page: dto.page,
    limit: dto.limit,
    total,
    rows,
  };
}

export async function adminPayments(dto: {
  status?: string;
  q?: string;
  page: number;
  limit: number;
}) {
  const repo = AppDataSource.getRepository(Payment);

  const qb = repo
    .createQueryBuilder("pay")
    .leftJoinAndSelect("pay.paidBy", "driverUser")
    .leftJoinAndSelect("pay.penalty", "p")
    .leftJoinAndSelect("p.vehicle", "v")
    .leftJoinAndSelect("p.issuedBy", "officer")
    .leftJoinAndSelect("p.violationType", "vt");

  if (dto.status) qb.andWhere("pay.status = :status", { status: dto.status });

  if (dto.q && dto.q.trim()) {
    const q = ilike(dto.q);
    qb.andWhere(
      "(pay.receiptNo ILIKE :q OR driverUser.email ILIKE :q OR v.plateNo ILIKE :q OR vt.code ILIKE :q)",
      { q }
    );
  }

  qb.orderBy("pay.paidAt", "DESC")
    .skip((dto.page - 1) * dto.limit)
    .take(dto.limit);

  const [rows, total] = await qb.getManyAndCount();

  return {
    page: dto.page,
    limit: dto.limit,
    total,
    rows,
  };
}

export async function adminIncidents(dto: {
  status?: string;
  type?: string;
  page: number;
  limit: number;
}) {
  const repo = AppDataSource.getRepository(Incident);

  const qb = repo
    .createQueryBuilder("i")
    .leftJoinAndSelect("i.reportedBy", "u")
    .leftJoinAndSelect("i.dispatches", "d");

  if (dto.status) qb.andWhere("i.status = :status", { status: dto.status });
  if (dto.type) qb.andWhere("i.type = :type", { type: dto.type });

  qb.orderBy("i.createdAt", "DESC")
    .skip((dto.page - 1) * dto.limit)
    .take(dto.limit);

  const [rows, total] = await qb.getManyAndCount();

  return {
    page: dto.page,
    limit: dto.limit,
    total,
    rows,
  };
}