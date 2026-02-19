import { z } from 'zod';

/**
 * AWS S3 specific schema.
 */
export const AwsS3CredentialsSchema = z.object({
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  region: z.string().min(1).optional(),
});
