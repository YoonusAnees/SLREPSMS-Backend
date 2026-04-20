import type { Request, Response, NextFunction } from "express";

// Extend Request to include a typed `user`
interface UserPayload {
  role: string;
  [key: string]: any; // other fields in your JWT payload
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

export function rbac(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}
