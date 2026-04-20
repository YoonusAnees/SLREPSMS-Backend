import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import {
  stripeCreateIntent,
  stripeCreateCheckout,
  stripeCheckoutSuccess,
  stripeConfirmDemo,
  mine,
} from "../controllers/payment.controller.js";
import { downloadReceiptPdf } from "../controllers/receipt.controller.js";

const r = Router();

r.post("/stripe/create-intent", auth, rbac(["DRIVER"]), stripeCreateIntent);

// NEW for Expo redirect payment
r.post("/stripe/create-checkout", auth, rbac(["DRIVER"]), stripeCreateCheckout);

// called by your web success page
r.post("/stripe/checkout-success", stripeCheckoutSuccess);

r.post("/stripe/confirm-demo", auth, rbac(["DRIVER"]), stripeConfirmDemo);
r.get("/my", auth, rbac(["DRIVER"]), mine);
r.get("/:paymentId/receipt.pdf", auth, rbac(["DRIVER"]), downloadReceiptPdf);

export default r;