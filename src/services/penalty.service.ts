import  AppDataSource  from "../config/data-source.js";
import { Penalty } from "../entities/Penalty.js";
import { User } from "../entities/User.js";
import { Driver, LicenseStatus } from "../entities/Driver.js";
import { ViolationType } from "../entities/ViolationType.js";
import { normalizePlate } from "../utils/normalizePlate.js";
import { Vehicle } from "../entities/Vehicle.js";


// export async function issuePenalty(officerUserId: string, dto: {
//   driverUserId: string;
//   violationCode: string;
//   locationText: string;
//   occurredAt: string;
//   notes?: string;
// }) {
//   return AppDataSource.transaction(async (trx) => {
//     const uRepo = trx.getRepository(User);
//     const dRepo = trx.getRepository(Driver);
//     const vRepo = trx.getRepository(ViolationType);
//     const pRepo = trx.getRepository(Penalty);

//     const officer = await uRepo.findOne({ where: { id: officerUserId } });
//     if (!officer || officer.role !== "OFFICER") throw Object.assign(new Error("Only OFFICER can issue penalties"), { status: 403 });

//     const driverUser = await uRepo.findOne({ where: { id: dto.driverUserId } });
//     if (!driverUser || driverUser.role !== "DRIVER") throw Object.assign(new Error("Target user is not a DRIVER"), { status: 400 });

//     const driver = await dRepo
//       .createQueryBuilder("d")
//       .leftJoin("d.user", "u")
//       .where("u.id = :id", { id: dto.driverUserId })
//       .getOne();

//     if (!driver) throw Object.assign(new Error("Driver profile not found (create it first)"), { status: 400 });

//     const v = await vRepo.findOne({ where: { code: dto.violationCode } });
//     if (!v) throw Object.assign(new Error("Violation code not found"), { status: 404 });

//     // Create penalty
//     const penalty = pRepo.create({
//       driverUser,
//       issuedBy: officer,
//       violationType: v,
//       status: "UNPAID",
//       fineLkr: v.baseFineLkr,
//       demeritPoints: v.demeritPoints,
//       occurredAt: new Date(dto.occurredAt),
//       locationText: dto.locationText,
//       notes: dto.notes ?? null
//     });

//     const saved = await pRepo.save(penalty);

//     // Demerit points rule (simple v1):
//     // Driver starts with 5 points; subtract violation points.
//     driver.currentPoints = Math.max(0, driver.currentPoints - v.demeritPoints);

//     // If points reach 0 => suspend for 1 month
//     if (driver.currentPoints === 0) {
//       driver.licenseStatus = LicenseStatus.SUSPENDED;
//       const now = new Date();
//       const suspendedUntil = new Date(now);
//       suspendedUntil.setMonth(suspendedUntil.getMonth() + 1);
//       driver.suspendedUntil = suspendedUntil;
//     }

//     await dRepo.save(driver);

//     return saved;
//   });
// }


export async function issuePenalty(
  officerUserId: string,
  dto: {
    licenseNo: string;
    plateNo?: string; // optional
    violationCode: string;
    locationText: string;
    occurredAt: string;
    notes?: string;
  }
) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const dRepo = trx.getRepository(Driver);
    const vtRepo = trx.getRepository(ViolationType);
    const vehRepo = trx.getRepository(Vehicle);
    const pRepo = trx.getRepository(Penalty);

    // 1) Officer check
    const officer = await uRepo.findOne({ where: { id: officerUserId } });
    if (!officer || officer.role !== "OFFICER") {
      throw Object.assign(new Error("Only OFFICER can issue penalties"), { status: 403 });
    }

    // 2) Find Driver by license number (SOURCE OF TRUTH)
    const driver = await dRepo
      .createQueryBuilder("d")
      .leftJoinAndSelect("d.user", "u")
      .where("d.licenseNo = :licenseNo", { licenseNo: dto.licenseNo })
      .getOne();

    if (!driver) {
      throw Object.assign(new Error("Driver not found for given licenseNo"), { status: 404 });
    }

    const driverUser = driver.user;
    if (!driverUser || driverUser.role !== "DRIVER") {
      throw Object.assign(new Error("Invalid driver user record"), { status: 400 });
    }

    // 3) Find violation type
    const vt = await vtRepo.findOne({ where: { code: dto.violationCode } });
    if (!vt) throw Object.assign(new Error("Violation code not found"), { status: 404 });

    // 4) Optional: attach vehicle (and verify ownership)
    let vehicle: Vehicle | null = null;

    if (dto.plateNo && dto.plateNo.trim().length > 0) {
      const plateNorm = normalizePlate(dto.plateNo);

      vehicle = await vehRepo.findOne({
        where: { plateNo: plateNorm },
        relations: { driver: { user: true } },
      });

      if (!vehicle) throw Object.assign(new Error("Vehicle not found for plateNo"), { status: 404 });

      // ownership validation: vehicle must belong to same driver
      if (vehicle.driver?.id !== driver.id) {
        throw Object.assign(new Error("Vehicle does not belong to the provided license owner"), { status: 409 });
      }

      if (!vehicle.ownershipVerified) {
  throw Object.assign(new Error("Vehicle ownership not verified"), { status: 409 });

  
}

  if (vehicle.insuranceExpiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(vehicle.insuranceExpiry);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      throw Object.assign(
        new Error("Vehicle insurance expired. Cannot issue penalty."),
        { status: 409 }
      );
    }
  }

  if (driver.licenseStatus === LicenseStatus.SUSPENDED) {
  throw Object.assign(
    new Error("Driver license is currently suspended."),
    { status: 409 }
  );
}

      // optional strict rule:
      // if (!vehicle.ownershipVerified) throw Object.assign(new Error("Vehicle ownership not verified"), { status: 409 });
    }

    // 5) Create penalty
    const penalty = pRepo.create({
      driverUser,
      issuedBy: officer,
      violationType: vt,
      vehicle : vehicle as Vehicle,
      status: "UNPAID",
      fineLkr: vt.baseFineLkr,
      demeritPoints: vt.demeritPoints,
      occurredAt: new Date(dto.occurredAt),
      locationText: dto.locationText,
      notes: dto.notes ?? null,

      // If you changed schema to include vehicle_id, attach it:
      ...(vehicle ? { vehicle } : {}),
    });

    const saved = await pRepo.save(penalty);

    // 6) Apply demerit points + suspension
    driver.currentPoints = Math.max(0, driver.currentPoints - vt.demeritPoints);

   if (driver.currentPoints === 0) {
  driver.licenseStatus = LicenseStatus.SUSPENDED;

  const now = new Date();

  if (driver.suspendedUntil && driver.suspendedUntil > now) {
    // Already suspended → extend by 1 month
    const extend = new Date(driver.suspendedUntil);
    extend.setMonth(extend.getMonth() + 1);
    driver.suspendedUntil = extend;
  } else {
    // New suspension
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    driver.suspendedUntil = until;
  }
}

    await dRepo.save(driver);
    return saved;
  });
}

export async function listMyPenalties(driverUserId: string) {
  return AppDataSource.getRepository(Penalty).find({
    where: { driverUser: { id: driverUserId } },
    relations: { violationType: true, issuedBy: true, driverUser: true ,vehicle:true},
    order: { occurredAt: "DESC" }
  });
}