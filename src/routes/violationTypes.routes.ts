import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { create, list , bulkCreate } from "../controllers/violationType.controller.js";

const r = Router();
r.get("/get", auth, list); // can allow all logged in users
r.post("/create", auth, rbac(["ADMIN", "OFFICER"]), create);
r.post("/bulk-create", auth, rbac(["ADMIN", "OFFICER"]), bulkCreate);
export default r;