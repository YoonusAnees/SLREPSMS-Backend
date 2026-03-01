import { Router } from "express";
import { register } from "../controllers/rescue-auth.controller.js";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { me, updateMe } from "../controllers/rescue-team.controller.js";

const r = Router();

r.post("/register", register);

// rescue logged-in profile
r.get("/me", auth, rbac(["RESCUE"]), me);
r.patch("/me", auth, rbac(["RESCUE"]), updateMe);

export default r;