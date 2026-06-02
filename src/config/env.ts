import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  JWT_ACCESS_SECRET: z.string().min(12).default("development-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(12).default("development-refresh-secret")
});

export const env = envSchema.parse(process.env);

