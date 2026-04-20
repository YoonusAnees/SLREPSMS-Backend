import Stripe from "stripe";
import { env } from "../config/env.js";

const secretKey = env.STRIPE_SECRET_KEY.trim();

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

console.log("STRIPE KEY DEBUG:", {
  exists: !!secretKey,
  prefix: secretKey.slice(0, 8),
  suffix: secretKey.slice(-4),
  length: secretKey.length,
});

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-02-25.clover",
});