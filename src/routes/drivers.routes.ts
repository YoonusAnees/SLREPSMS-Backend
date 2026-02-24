import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { getMe, upsertMe, updateMeDriver } from "../controllers/driver.controller.js";

const r = Router();
r.get("/me", auth, rbac(["DRIVER"]), getMe);
r.post("/me", auth, rbac(["DRIVER"]), upsertMe);
r.put("/me/update", auth, rbac(["DRIVER"]), updateMeDriver);
export default r;