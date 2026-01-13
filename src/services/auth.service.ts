import bcrypt from "bcryptjs";
import AppDataSource  from "../config/data-source.js";
import { User } from "../entities/User.js";
import { RefreshToken } from "../entities/RefreshToken.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { IsNull } from "typeorm";


export async function registerUser(payload: {
  name: string; email: string; role: any; password: string; phone?: string; nic?: string;
}) {
  const repo = AppDataSource.getRepository(User);
  const exists = await repo.findOne({ where: { email: payload.email } });
  if (exists) throw Object.assign(new Error("Email already exists"), { status: 409 });

  const passwordHash = await hashPassword(payload.password);
  const u = repo.create({
    name: payload.name,
    email: payload.email,
    role: payload.role,
    passwordHash,
    phone: payload.phone,
    nic: payload.nic
  });
  await repo.save(u);
  return u;
}

export async function login(email: string, password: string) {
  const repo = AppDataSource.getRepository(User);
  const rtRepo = AppDataSource.getRepository(RefreshToken);

  const user = await repo.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  const tokenHash = await bcrypt.hash(refreshToken, 12);
  const expiresAt = new Date(Date.now() + env.REFRESH_TTL_SEC * 1000);

  // ✅ revoke existing active refresh tokens
  await rtRepo.update(
    { userId: user.id, revokedAt: IsNull() },
    { revokedAt: new Date() }
  );

  // ✅ save new refresh token
  await rtRepo.save(
    rtRepo.create({ userId: user.id, tokenHash, expiresAt })
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function logoutUser(refreshToken: string) {
  const rtRepo = AppDataSource.getRepository(RefreshToken);

  // Find the active refresh token
  const record = await rtRepo.findOne({
    where: { revokedAt: IsNull() },
  });

  if (!record) {
    // Already revoked or invalid token, you can ignore or throw error
    return;
  }

  // Check if the provided token matches
  const ok = await bcrypt.compare(refreshToken, record.tokenHash);
  if (!ok) return; // token doesn't match, do nothing

  // Revoke it
  record.revokedAt = new Date();
  await rtRepo.save(record);
}

export async function refresh(refreshToken: string) {
  const rtRepo = AppDataSource.getRepository(RefreshToken);
  const payload = verifyRefreshToken(refreshToken);
  if (payload.typ !== "refresh")
    throw Object.assign(new Error("Invalid refresh"), { status: 401 });

  // ✅ Use IsNull() instead of null
  const record = await rtRepo.findOne({
    where: { userId: payload.sub, revokedAt: IsNull() },
  });
  if (!record)
    throw Object.assign(new Error("Refresh expired"), { status: 401 });
  if (record.expiresAt.getTime() < Date.now())
    throw Object.assign(new Error("Refresh expired"), { status: 401 });

  const ok = await bcrypt.compare(refreshToken, record.tokenHash);
  if (!ok) throw Object.assign(new Error("Refresh invalid"), { status: 401 });

  // Revoke current token
  record.revokedAt = new Date();
  await rtRepo.save(record);

  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: payload.sub },
  });
  if (!user) throw Object.assign(new Error("User not found"), { status: 401 });

  // Generate new tokens
  const newAccess = signAccessToken(user.id, user.role);
  const newRefresh = signRefreshToken(user.id, user.role);

  const newHash = await bcrypt.hash(newRefresh, 12);
  await rtRepo.save(
    rtRepo.create({
      userId: user.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + env.REFRESH_TTL_SEC * 1000),
    })
  );

  return { accessToken: newAccess, refreshToken: newRefresh };
}
