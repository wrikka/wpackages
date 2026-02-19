import { z } from 'zod';

/**
 * Base schema includes all possible credential fields as optional.
 * Used for the initial SDK config validation.
 */
export const BaseServiceCredentialsSchema = z.object({
  apiKey: z.string().optional(),
  apiToken: z.string().optional(),
  accessToken: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  oauth2Token: z.string().optional(),
  token: z.string().optional(),
  username: z.string().optional(),
  appPassword: z.string().optional(),
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
});
