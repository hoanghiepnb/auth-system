import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig({ path: '.env' });

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string().optional(),
  DB_NAME: z.string(),

  // JWT Auth
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_EXPIRATION_SECONDS: z.coerce.number().default(900),
  JWT_REFRESH_SECRET: z.string().default('refresh_secret_key'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRATION_DAYS: z.coerce.number().default(7),

  // Auth settings
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(14).default(12),
  MIN_PASSWORD_LENGTH: z.coerce.number().min(6).default(8),
  MAX_PASSWORD_LENGTH: z.coerce.number().min(8).default(20),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().min(3).default(5),
  ACCOUNT_LOCK_DURATION_MINUTES: z.coerce.number().min(5).default(30),
  RESET_TOKEN_EXPIRATION_MS: z.coerce.number().default(3600000),

  PORT: z.string().default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = envSchema.parse(process.env);

export type EnvInterface = typeof env;
