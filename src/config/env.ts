import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
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

export const env = {
  PORT: parsedEnv.PORT,
  NODE_ENV: parsedEnv.NODE_ENV,

  DB_HOST: parsedEnv.DB_HOST,
  DB_PORT: parsedEnv.DB_PORT,
  DB_USER: parsedEnv.DB_USER,
  DB_PASS: parsedEnv.DB_PASS,
  DB_NAME: parsedEnv.DB_NAME,
  DB_URL: parsedEnv.DB_URL,

  JWT_ACCESS_SECRET: parsedEnv.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: parsedEnv.JWT_REFRESH_SECRET,
  ACCESS_TTL_SEC: parsedEnv.ACCESS_TTL_SEC,
  REFRESH_TTL_SEC: parsedEnv.REFRESH_TTL_SEC,

  PAYMENT_WEBHOOK_SECRET: parsedEnv.PAYMENT_WEBHOOK_SECRET,

  STRIPE_SECRET_KEY: parsedEnv.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: parsedEnv.STRIPE_WEBHOOK_SECRET,
  STRIPE_CURRENCY: parsedEnv.STRIPE_CURRENCY,
} as const;