import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { create, list } from "../controllers/incident.controller.js";
import { upload } from "../utils/upload.js";

const r = Router();

// driver/officer/admin can create incident
r.post("/", auth, rbac(["DRIVER", "OFFICER", "ADMIN"]), upload.single("evidence"), create);

// admin/officer/dispatcher can list all incidents
r.get("/", auth, rbac(["OFFICER", "ADMIN"]), list);

export default r;