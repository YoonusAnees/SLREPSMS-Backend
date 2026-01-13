import { Router } from "express";
import { register, loginCtrl, refreshCtrl } from "../controllers/auth.controller.js";

const r = Router();
r.post("/register", register);
r.post("/login", loginCtrl);
r.post("/refresh", refreshCtrl);
export default r;
