import Stripe from "stripe";
import { env } from "../config/env.js";

const rawSecretKey = env.STRIPE_SECRET_KEY;

if (!rawSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const secretKey = rawSecretKey!.trim();

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-02-25.clover",
});