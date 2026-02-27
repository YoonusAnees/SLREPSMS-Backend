import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { create, list , bulkCreate } from "../controllers/violationType.controller.js";

const r = Router();
r.get("/", auth, list); // can allow all logged in users
r.post("/", auth, rbac(["ADMIN"]), create);
r.post("/bulk", auth, rbac(["ADMIN"]), bulkCreate);
export default r;