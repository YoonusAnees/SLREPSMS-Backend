import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TTL_SEC: z.string().transform(Number),
  REFRESH_TTL_SEC: z.string().transform(Number),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_PUBLIC_BASE: z.string(),
  PAYMENT_WEBHOOK_SECRET: z.string(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  PORT: parsedEnv.PORT,
  DB_HOST: parsedEnv.DB_HOST,
  DB_PORT: parsedEnv.DB_PORT,
  DB_USER: parsedEnv.DB_USER,
  DB_PASS: parsedEnv.DB_PASS,
  DB_NAME: parsedEnv.DB_NAME,
  JWT_ACCESS_SECRET: parsedEnv.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: parsedEnv.JWT_REFRESH_SECRET,
  ACCESS_TTL_SEC: parsedEnv.ACCESS_TTL_SEC,
  REFRESH_TTL_SEC: parsedEnv.REFRESH_TTL_SEC,
  REDIS_HOST: parsedEnv.REDIS_HOST,
  REDIS_PORT: parsedEnv.REDIS_PORT,
  S3_ENDPOINT: parsedEnv.S3_ENDPOINT,
  S3_REGION: parsedEnv.S3_REGION,
  S3_ACCESS_KEY: parsedEnv.S3_ACCESS_KEY,
  S3_SECRET_KEY: parsedEnv.S3_SECRET_KEY,
  S3_BUCKET: parsedEnv.S3_BUCKET,
  S3_PUBLIC_BASE: parsedEnv.S3_PUBLIC_BASE,
  PAYMENT_WEBHOOK_SECRET: parsedEnv.PAYMENT_WEBHOOK_SECRET,
} as const;
