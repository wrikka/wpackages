import { z } from 'zod';
import { Auth0CredentialsSchema } from '../schemas/auth0';

/**
 * Auth0 specific credentials type.
 */
export type Auth0Credentials = z.infer<typeof Auth0CredentialsSchema>;
