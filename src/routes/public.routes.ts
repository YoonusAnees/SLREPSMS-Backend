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
r.get("/dashboard", dashboard);
r.get("/users",  listUsers);
r.get("/penalties",  listPenalties);
r.get("/payments",  listPayments);
r.get("/incidents", listIncidents);

export default r;