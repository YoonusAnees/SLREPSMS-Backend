import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { createPenalty, myPenalties } from "../controllers/penalty.controller.js";

const r = Router();
r.post("/", auth, rbac(["OFFICER"]), createPenalty);
r.get("/my", auth, rbac(["DRIVER"]), myPenalties);
export default r;