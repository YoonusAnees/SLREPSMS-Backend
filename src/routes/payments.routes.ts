import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { pay, mine } from "../controllers/payment.controller.js";

const r = Router();

r.post("/", auth, rbac(["DRIVER"]), pay);
r.get("/my", auth, rbac(["DRIVER"]), mine);

export default r;