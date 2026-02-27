import  AppDataSource  from "../config/data-source.js";
import { Penalty } from "../entities/Penalty.js";
import { User } from "../entities/User.js";
import { Driver, LicenseStatus } from "../entities/Driver.js";
import { ViolationType } from "../entities/ViolationType.js";

export async function issuePenalty(officerUserId: string, dto: {
  driverUserId: string;
  violationCode: string;
  locationText: string;
  occurredAt: string;
  notes?: string;
}) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const dRepo = trx.getRepository(Driver);
    const vRepo = trx.getRepository(ViolationType);
    const pRepo = trx.getRepository(Penalty);

    const officer = await uRepo.findOne({ where: { id: officerUserId } });
    if (!officer || officer.role !== "OFFICER") throw Object.assign(new Error("Only OFFICER can issue penalties"), { status: 403 });

    const driverUser = await uRepo.findOne({ where: { id: dto.driverUserId } });
    if (!driverUser || driverUser.role !== "DRIVER") throw Object.assign(new Error("Target user is not a DRIVER"), { status: 400 });

    const driver = await dRepo
      .createQueryBuilder("d")
      .leftJoin("d.user", "u")
      .where("u.id = :id", { id: dto.driverUserId })
      .getOne();

    if (!driver) throw Object.assign(new Error("Driver profile not found (create it first)"), { status: 400 });

    const v = await vRepo.findOne({ where: { code: dto.violationCode } });
    if (!v) throw Object.assign(new Error("Violation code not found"), { status: 404 });

    // Create penalty
    const penalty = pRepo.create({
      driverUser,
      issuedBy: officer,
      violationType: v,
      status: "UNPAID",
      fineLkr: v.baseFineLkr,
      demeritPoints: v.demeritPoints,
      occurredAt: new Date(dto.occurredAt),
      locationText: dto.locationText,
      notes: dto.notes ?? null
    });

    const saved = await pRepo.save(penalty);

    // Demerit points rule (simple v1):
    // Driver starts with 5 points; subtract violation points.
    driver.currentPoints = Math.max(0, driver.currentPoints - v.demeritPoints);

    // If points reach 0 => suspend for 1 month
    if (driver.currentPoints === 0) {
      driver.licenseStatus = LicenseStatus.SUSPENDED;
      const now = new Date();
      const suspendedUntil = new Date(now);
      suspendedUntil.setMonth(suspendedUntil.getMonth() + 1);
      driver.suspendedUntil = suspendedUntil;
    }

    await dRepo.save(driver);

    return saved;
  });
}

export async function listMyPenalties(driverUserId: string) {
  return AppDataSource.getRepository(Penalty).find({
    where: { driverUser: { id: driverUserId } },
    relations: { violationType: true, issuedBy: true, driverUser: true },
    order: { occurredAt: "DESC" }
  });
}