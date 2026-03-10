import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(10000),
  NODE_ENV: z.string().optional(),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  DB_URL: z.string().optional(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TTL_SEC: z.coerce.number(),
  REFRESH_TTL_SEC: z.coerce.number(),

  PAYMENT_WEBHOOK_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CURRENCY: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = parsedEnv;