import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import {
  createVehicle,
  myVehicles,
  verifyVehicle,
  getByPlateNo,
} from "../controllers/vehicle.controller.js";

const r = Router();

r.post("/add", auth, rbac(["DRIVER"]), createVehicle);
r.get("/my", auth, rbac(["DRIVER"]), myVehicles);
r.get("/by-plate/:plateNo", auth, rbac(["DRIVER", "OFFICER", "ADMIN"]), getByPlateNo);
r.post("/verify/:plateNo", auth, rbac(["ADMIN", "OFFICER"]), verifyVehicle);

export default r;