import { Router } from "express";
import { register, loginCtrl, refreshCtrl ,logoutCtrl, bulkRegister} from "../controllers/auth.controller.js";

const r = Router();
r.post("/register", register);
r.post("/bulk-register", bulkRegister);
r.post("/login", loginCtrl);
r.post("/refresh", refreshCtrl);
r.post("/logout", logoutCtrl); 
export default r;
