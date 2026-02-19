import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  D1_DATABASE_PATH: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  AICHAT_EXTENSION_TOKEN: z.string().optional(),
});

export function validateEnv(env: Record<string, any>) {
  try {
    return envSchema.parse(env);
  } catch (error) {
    logger.error('Invalid environment variables:', error);
    process.exit(1);
  }
}
