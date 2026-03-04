import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import {
  dashboard,
  listUsers,
  listPenalties,
  listPayments,
  listIncidents,
} from "../controllers/admin.controller.js";

const r = Router();

// ADMIN only
r.get("/dashboard", auth, rbac(["ADMIN"]), dashboard);
r.get("/users", auth, rbac(["ADMIN"]), listUsers);
r.get("/penalties", auth, rbac(["ADMIN"]), listPenalties);
r.get("/payments", auth, rbac(["ADMIN"]), listPayments);
r.get("/incidents", auth, rbac(["ADMIN"]), listIncidents);

export default r;