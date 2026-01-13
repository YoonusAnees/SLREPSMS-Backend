import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = { sub: string; role: string; typ?: "access" | "refresh" };

export function signAccessToken(sub: string, role: string) {
  return jwt.sign({ sub, role, typ: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TTL_SEC });
}

export function signRefreshToken(sub: string, role: string) {
  return jwt.sign({ sub, role, typ: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TTL_SEC });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}
