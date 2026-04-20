import bcrypt from "bcryptjs";
import AppDataSource from "../config/data-source.js";
import { User } from "../entities/User.js";
import { RefreshToken } from "../entities/RefreshToken.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { env } from "../config/env.js";
import { IsNull } from "typeorm";

// ================= REGISTER =================
export async function registerUser(payload: {
  name: string;
  email: string;
  role: any;
  password: string;
  phone?: string;
  nic?: string;
}) {
  const repo = AppDataSource.getRepository(User);

  const exists = await repo.findOne({ where: { email: payload.email } });
  if (exists)
    throw Object.assign(new Error("Email already exists"), { status: 409 });

  const passwordHash = await hashPassword(payload.password);

  const user = repo.create({
    name: payload.name,
    email: payload.email,
    role: payload.role,
    passwordHash,
    phone: payload.phone,
    nic: payload.nic,
  });

  await repo.save(user);
  return user;
}

// ================= BULK REGISTER =================
export async function bulkRegisterUsers(
  items: {
    name: string;
    email: string;
    role: any;
    password: string;
    phone?: string;
    nic?: string;
  }[]
) {
  const repo = AppDataSource.getRepository(User);
  const usersToSave: User[] = [];

  for (const item of items) {
    const exists = await repo.findOne({ where: { email: item.email } });

    if (exists) {
      throw Object.assign(
        new Error(`Email already exists: ${item.email}`),
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(item.password);

    const user = repo.create({
      name: item.name,
      email: item.email,
      role: item.role,
      passwordHash,
      phone: item.phone,
      nic: item.nic,
    });

    usersToSave.push(user);
  }

  await repo.save(usersToSave);
  return usersToSave;
}

// ================= LOGIN =================
export async function login(email: string, password: string) {
  const userRepo = AppDataSource.getRepository(User);
  const rtRepo = AppDataSource.getRepository(RefreshToken);

  const user = await userRepo.findOne({ where: { email } });

  // 🔒 Always same error (no info leak)
  if (!user)
    throw Object.assign(new Error("Credential error"), { status: 401 });

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid)
    throw Object.assign(new Error("Credential error"), { status: 401 });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  const tokenHash = await bcrypt.hash(refreshToken, 12);
  const expiresAt = new Date(Date.now() + env.REFRESH_TTL_SEC * 1000);

  // Revoke old tokens
  await rtRepo.update(
    { userId: user.id, revokedAt: IsNull() },
    { revokedAt: new Date() }
  );

  // Save new token
  await rtRepo.save(
    rtRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    })
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      nic: user.nic,
    },
  };
}

// ================= LOGOUT =================
export async function logoutUser(refreshToken: string) {
  const rtRepo = AppDataSource.getRepository(RefreshToken);

  const activeTokens = await rtRepo.find({
    where: { revokedAt: IsNull() },
  });

  for (const record of activeTokens) {
    const match = await bcrypt.compare(refreshToken, record.tokenHash);

    if (match) {
      record.revokedAt = new Date();
      await rtRepo.save(record);
      return;
    }
  }

  // Optional: silent fail OR throw generic
  throw Object.assign(new Error("Credential error"), { status: 401 });
}

// ================= REFRESH =================
export async function refresh(refreshToken: string) {
  const rtRepo = AppDataSource.getRepository(RefreshToken);

  let payload: any;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Object.assign(new Error("Credential error"), { status: 401 });
  }

  if (payload.typ !== "refresh") {
    throw Object.assign(new Error("Credential error"), { status: 401 });
  }

  const record = await rtRepo.findOne({
    where: { userId: payload.sub, revokedAt: IsNull() },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error("Credential error"), { status: 401 });
  }

  const valid = await bcrypt.compare(refreshToken, record.tokenHash);

  if (!valid) {
    throw Object.assign(new Error("Credential error"), { status: 401 });
  }

  // Revoke old token
  record.revokedAt = new Date();
  await rtRepo.save(record);

  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: payload.sub },
  });

  if (!user) {
    throw Object.assign(new Error("Credential error"), { status: 401 });
  }

  const newAccessToken = signAccessToken(user.id, user.role);
  const newRefreshToken = signRefreshToken(user.id, user.role);

  const newHash = await bcrypt.hash(newRefreshToken, 12);

  await rtRepo.save(
    rtRepo.create({
      userId: user.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + env.REFRESH_TTL_SEC * 1000),
    })
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}