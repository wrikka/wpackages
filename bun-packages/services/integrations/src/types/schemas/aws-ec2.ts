import { z } from 'zod';

/**
 * AWS EC2 specific credentials schema.
 */
export const AwsEc2CredentialsSchema = z.object({
  accessKeyId: z.string().min(1, 'AWS Access Key ID is required'),
  secretAccessKey: z.string().min(1, 'AWS Secret Access Key is required'),
  region: z.string().optional(),
  sessionToken: z.string().optional(),
});

/**
 * AWS EC2 credentials type.
 */
export type AwsEc2Credentials = z.infer<typeof AwsEc2CredentialsSchema>;
