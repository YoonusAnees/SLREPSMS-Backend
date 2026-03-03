import  AppDataSource  from "../config/data-source.js";
import { Driver, LicenseStatus } from "../entities/Driver.js";
import  {User}  from "../entities/User.js";
import { Vehicle } from "../entities/Vehicle.js";

export async function getMyDriverProfile(userId: string) {
  const repo = AppDataSource.getRepository(Driver);
  const driver = await repo
    .createQueryBuilder("d")
    .leftJoinAndSelect("d.user", "u")
    .where("u.id = :userId", { userId })
    .getOne();

  if (!driver) throw Object.assign(new Error("Driver profile not found"), { status: 404 });
  return driver;
}

export async function upsertMyDriverProfile(userId: string, dto: { licenseNo: string; initialPoints?: number }) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const dRepo = trx.getRepository(Driver);

    const user = await uRepo.findOne({ where: { id: userId } });
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
    if (user.role !== "DRIVER") throw Object.assign(new Error("Only DRIVER can create driver profile"), { status: 403 });

    let driver = await dRepo
      .createQueryBuilder("d")
      .leftJoinAndSelect("d.user", "u")
      .where("u.id = :userId", { userId })
      .getOne();

    if (!driver) {
      driver = dRepo.create({
        user,
        licenseNo: dto.licenseNo,
        currentPoints: dto.initialPoints ?? 5,
        licenseStatus: LicenseStatus.ACTIVE,
        suspendedUntil: null
      });
    } else {
      driver.licenseNo = dto.licenseNo;
      if (typeof dto.initialPoints === "number") driver.currentPoints = dto.initialPoints;
    }

    return dRepo.save(driver);
  });
}


export async function updateMyProfile(
  userId: string,
  dto: { name?: string; phone?: string; nic?: string }
) {
  const repo = AppDataSource.getRepository(User);

  const user = await repo.findOne({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  if (dto.name !== undefined) user.name = dto.name;
  if (dto.phone !== undefined) user.phone = dto.phone;
  if (dto.nic !== undefined) user.nic = dto.nic;

  return repo.save(user);
}



export async function getDriverByLicenseNo(licenseNo: string) {
  const lic = licenseNo.trim();

  const dRepo = AppDataSource.getRepository(Driver);
  const vRepo = AppDataSource.getRepository(Vehicle);

  const driver = await dRepo
    .createQueryBuilder("d")
    .leftJoinAndSelect("d.user", "u")
    .where("d.license_no = :lic", { lic }) // ✅ IMPORTANT: DB column is license_no
    .getOne();

  if (!driver) {
    throw Object.assign(new Error("Driver not found for given licenseNo"), { status: 404 });
  }

  const vehicles = await vRepo.find({
    where: { driver: { id: driver.id } } as any,
    order: { createdAt: "DESC" } as any,
  });

  // ✅ Return a nice payload for officer UI
  return {
    driver: {
      id: driver.id,
      licenseNo: driver.licenseNo,
      currentPoints: driver.currentPoints,
      licenseStatus: driver.licenseStatus,
      suspendedUntil: driver.suspendedUntil,
    },
    user: {
      id: driver.user.id,
      name: driver.user.name,
      email: driver.user.email,
      phone: driver.user.phone ?? null,
      nic: driver.user.nic ?? null,
      role: driver.user.role,
      createdAt: driver.user.createdAt,
    },
    vehicles: vehicles.map((v) => ({
      id: v.id,
      plateNo: v.plateNo,
      type: v.type,
      model: v.model ?? null,
      color: v.color ?? null,
      year: v.year ?? null,
      insuranceExpiry: v.insuranceExpiry ?? null,
      ownershipVerified: v.ownershipVerified,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })),
  };
}