import AppDataSource from "../config/data-source.js";
import { User } from "../entities/User.js";
import { RescueTeam } from "../entities/RescueTeam.js";
import { pointWkt } from "../utils/geo.js";
import bcrypt from "bcryptjs";

export async function registerRescue(dto: {
  name: string;
  email: string;
  password: string;
  teamCode: string;
  phone?: string;
  baseLat: number;
  baseLng: number;
  baseLocationText?: string;
}) {
  return AppDataSource.transaction(async (trx) => {
    const uRepo = trx.getRepository(User);
    const rtRepo = trx.getRepository(RescueTeam);

    const existing = await uRepo.findOne({ where: { email: dto.email } });
    if (existing) throw Object.assign(new Error("Email already exists"), { status: 409 });

    const codeExists = await rtRepo.findOne({ where: { teamCode: dto.teamCode } });
    if (codeExists) throw Object.assign(new Error("Team code already exists"), { status: 409 });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = uRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: "RESCUE",
      phone: dto.phone ?? undefined, // ✅
    });

    const savedUser = await uRepo.save(user);

    const rescue = rtRepo.create({
      user: savedUser, // ✅ now exists
      teamCode: dto.teamCode,
      name: dto.name,
      phone: dto.phone ?? undefined, // ✅
      status: "AVAILABLE",
      baseLocation: pointWkt(dto.baseLng, dto.baseLat),
      baseLocationText: dto.baseLocationText ?? undefined, // ✅
    });

    const savedRescue = await rtRepo.save(rescue);

    return {
      user: { id: savedUser.id, email: savedUser.email, role: savedUser.role },
      rescueTeam: savedRescue,
    };
  });
}