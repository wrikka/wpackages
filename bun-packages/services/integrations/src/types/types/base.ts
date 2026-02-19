import { z } from 'zod';
import { BaseServiceCredentialsSchema } from '../schemas/base';

/**
 * Base credentials type inferred from schema.
 */
export type BaseServiceCredentials = z.infer<typeof BaseServiceCredentialsSchema>;

/**
 * Generic service configuration type.
 * @template C - Credentials type for the specific service.
 */
export type ServiceConfig<C> = {
  baseUrl?: string;
  region?: string;
  credentials: C;
  retries?: number;
  extra?: Record<string, any>;
};
