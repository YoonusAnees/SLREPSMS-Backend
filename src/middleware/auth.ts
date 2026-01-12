import type { Request, Response, NextFunction } from "express"; // <-- type-only import
import { verifyAccessToken } from "../utils/jwt.js";

// Extend Request to include `user`
interface AuthRequest extends Request {
  user?: ReturnType<typeof verifyAccessToken>;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing token" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    req.user = verifyAccessToken(token); // fully typed now
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid/expired token" });
  }
}
