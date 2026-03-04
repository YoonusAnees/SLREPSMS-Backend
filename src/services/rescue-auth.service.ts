// src/services/rescue-auth.service.ts
import bcrypt from "bcryptjs";
import AppDataSource from "../config/data-source.js";
import { User } from "../entities/User.js";
import { RescueTeam } from "../entities/RescueTeam.js";
import { RefreshToken } from "../entities/RefreshToken.js";
import { pointGeoJSON } from "../utils/geo.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { IsNull } from "typeorm";
import type { DeepPartial } from "typeorm";

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
    const refreshRepo = trx.getRepository(RefreshToken);

    // 1) checks
    const existing = await uRepo.findOne({ where: { email: dto.email } });
    if (existing) throw Object.assign(new Error("Email already exists"), { status: 409 });

    const codeExists = await rtRepo.findOne({ where: { teamCode: dto.teamCode } });
    if (codeExists) throw Object.assign(new Error("Team code already exists"), { status: 409 });

    // 2) create RESCUE user
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = uRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: "RESCUE",
      phone: dto.phone ?? undefined,
    });

    const savedUser = await uRepo.save(user);

    // 3) create rescue team profile
    const rescuePayload: DeepPartial<RescueTeam> = {
      user: savedUser,
      teamCode: dto.teamCode,
      name: dto.name,
      phone: dto.phone ?? undefined,
      status: "AVAILABLE",
      baseLocation: pointGeoJSON(dto.baseLng, dto.baseLat),
      baseLocationText: dto.baseLocationText ?? undefined,
    };

    const rescue = rtRepo.create(rescuePayload);
    const savedRescue = await rtRepo.save(rescue);

    // 4) issue tokens (same as normal auth/login)
    const accessToken = signAccessToken(savedUser.id, savedUser.role);
    const refreshToken = signRefreshToken(savedUser.id, savedUser.role);

    const tokenHash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = new Date(Date.now() + env.REFRESH_TTL_SEC * 1000);

    // revoke old active refresh tokens (if any)
    await refreshRepo.update(
      { userId: savedUser.id, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );

    // store refresh token hash
    await refreshRepo.save(
      refreshRepo.create({ userId: savedUser.id, tokenHash, expiresAt })
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      rescueTeam: savedRescue,
    };
  });
}