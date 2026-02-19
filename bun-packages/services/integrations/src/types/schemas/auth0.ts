import { z } from 'zod';

/**
 * Auth0 specific credentials schema.
 */
export const Auth0CredentialsSchema = z.object({
  domain: z.string().min(1, 'Auth0 domain is required'),
  clientId: z.string().min(1, 'Auth0 client ID is required'),
  clientSecret: z.string().min(1, 'Auth0 client secret is required'),
  managementToken: z.string().optional(),
});

/**
 * Auth0 credentials type.
 */
export type Auth0Credentials = z.infer<typeof Auth0CredentialsSchema>;
