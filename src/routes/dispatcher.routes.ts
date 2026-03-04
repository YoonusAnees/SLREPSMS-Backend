import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { nearest, dispatch, updateStatus } from "../controllers/dispatch.controller.js";

const r = Router();

r.post("/nearest", auth, rbac(["OFFICER", "ADMIN","DRIVER"]), nearest);
r.post("/", auth, rbac(["OFFICER", "ADMIN","DRIVER"]), dispatch);
r.patch("/status", auth, rbac(["OFFICER", "ADMIN","DRIVER"]), updateStatus);

export default r;