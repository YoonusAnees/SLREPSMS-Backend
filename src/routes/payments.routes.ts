import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { stripeCreateIntent, stripeConfirmDemo, mine } from "../controllers/payment.controller.js";

const r = Router();

r.post("/stripe/create-intent", auth, rbac(["DRIVER"]), stripeCreateIntent);
r.post("/stripe/confirm-demo", auth, rbac(["DRIVER"]), stripeConfirmDemo);
r.get("/my", auth, rbac(["DRIVER"]), mine);

export default r;