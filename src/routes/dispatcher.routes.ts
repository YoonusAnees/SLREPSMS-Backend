import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import {
  nearest,
  dispatch,
  updateStatus,
  myDispatches,
  allDispatches,
  stats,
} from "../controllers/dispatch.controller.js";

const r = Router();

r.post("/nearest", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), nearest);

r.get("/stats", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), stats);
r.get("/me", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), myDispatches);

r.get("/", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), allDispatches);

r.post("/", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), dispatch);
r.patch("/status", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), updateStatus);
export default r;