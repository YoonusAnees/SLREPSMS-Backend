import Stripe from "stripe";
import { env } from "../config/env.js";

const rawSecretKey = env.STRIPE_SECRET_KEY;

if (!rawSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const secretKey = rawSecretKey.trim();

console.log("STRIPE KEY DEBUG:", {
  exists: !!secretKey,
  prefix: secretKey.slice(0, 8),
  suffix: secretKey.slice(-4),
  length: secretKey.length,
});

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-02-25.clover",
});