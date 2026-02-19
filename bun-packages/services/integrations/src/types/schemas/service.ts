import { z } from 'zod';
import { BaseServiceCredentialsSchema } from './base';

/**
 * Service configuration schema with validation.
 */
export const ServiceConfigSchema = z.object({
  baseUrl: z.string().url().optional(),
  region: z.string().optional(),
  credentials: BaseServiceCredentialsSchema,
  retries: z.number().int().min(0).max(5).default(3),
  extra: z.record(z.string(), z.any()).optional(),
});

/**
 * SDK configuration schema for multiple services.
 */
export const SdkConfigSchema = z.record(z.string(), ServiceConfigSchema);
