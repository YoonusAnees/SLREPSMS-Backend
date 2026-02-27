import  AppDataSource  from "../config/data-source.js";
import { Vehicle } from "../entities/Vehicle.js";
import { Driver } from "../entities/Driver.js";

export async function addVehicle(userId: string, dto: {
  plateNo: string;
  type: string;
}) {
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

    const vehicle = vRepo.create({
      plateNo: dto.plateNo,
      type: dto.type,
      driver
    });

    return vRepo.save(vehicle);
  });
}

export async function listMyVehicles(userId: string) {
  const repo = AppDataSource.getRepository(Vehicle);

  return repo
    .createQueryBuilder("v")
    .leftJoin("v.driver", "d")
    .leftJoin("d.user", "u")
    .where("u.id = :id", { id: userId })
    .getMany();
}