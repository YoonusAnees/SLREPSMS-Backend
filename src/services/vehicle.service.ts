import  AppDataSource  from "../config/data-source.js";
import { Vehicle } from "../entities/Vehicle.js";
import { Driver } from "../entities/Driver.js";
import { normalizePlate } from "../utils/normalizePlate.js";
import { User } from "../entities/User.js";

export async function addVehicle(
  userId: string,
  dto: {
    plateNo: string;
    type: string;
    model?: string;
    color?: string;
    year?: number;
    insuranceExpiry?: string; // YYYY-MM-DD
  }
) {
  return AppDataSource.transaction(async (trx) => {
    const dRepo = trx.getRepository(Driver);
    const vRepo = trx.getRepository(Vehicle);

    const driver = await dRepo
      .createQueryBuilder("d")
      .leftJoin("d.user", "u")
      .where("u.id = :id", { id: userId })
      .getOne();

    if (!driver) {
      throw Object.assign(new Error("Driver profile not found"), { status: 400 });
    }

    const plateNorm = normalizePlate(dto.plateNo);

    const exists = await vRepo.findOne({ where: { plateNo: plateNorm } });
    if (exists) {
      throw Object.assign(new Error("Vehicle plate already exists"), { status: 409 });
    }

    const vehicle = vRepo.create({
      plateNo: plateNorm,
      type: dto.type,
      model: dto.model ?? null,
      color: dto.color ?? null,
      year: dto.year ?? null,
      insuranceExpiry: dto.insuranceExpiry ?? null,
      ownershipVerified: false,
      driver,
    });

    return vRepo.save(vehicle);
  });
}

export async function listMyVehicles(userId: string) {
  return AppDataSource.getRepository(Vehicle)
    .createQueryBuilder("v")
    .leftJoinAndSelect("v.driver", "d")
    .leftJoinAndSelect("d.user", "u")
    .where("u.id = :id", { id: userId })
    .orderBy("v.created_at", "DESC")
    .getMany();
}


export async function verifyVehicleOwnership(
  verifierUserId: string,
  plateNo: string
) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const vRepo = trx.getRepository(Vehicle);

    const verifier = await uRepo.findOne({ where: { id: verifierUserId } });

    if (!verifier || (verifier.role !== "ADMIN" && verifier.role !== "OFFICER")) {
      throw Object.assign(new Error("Only ADMIN or OFFICER can verify ownership"), { status: 403 });
    }

    const plateNorm = normalizePlate(plateNo);

    const vehicle = await vRepo.findOne({
      where: { plateNo: plateNorm },
      relations: { driver: { user: true } },
    });

    if (!vehicle) {
      throw Object.assign(new Error("Vehicle not found"), { status: 404 });
    }

    if (vehicle.ownershipVerified) {
      return vehicle; // already verified (safe idempotent behavior)
    }

    vehicle.ownershipVerified = true;

    return vRepo.save(vehicle);
  });
}