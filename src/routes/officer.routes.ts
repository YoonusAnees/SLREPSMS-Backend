import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { myDashboard } from "../controllers/officer.controller.js";

const r = Router();

r.get("/dashboard/me", auth, rbac(["OFFICER"]), myDashboard);

export default r;