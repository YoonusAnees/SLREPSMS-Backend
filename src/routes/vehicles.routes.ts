import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { createVehicle, myVehicles } from "../controllers/vehicle.controller.js";

const r = Router();

r.post("/add", auth, rbac(["DRIVER"]), createVehicle);
r.get("/my", auth, rbac(["DRIVER"]), myVehicles);

export default r;