import { z } from 'zod';
import { AwsS3CredentialsSchema } from '../schemas/aws';
import { SdkConfigSchema } from '../schemas/service';

/**
 * AWS S3 specific credentials type.
 */
export type AwsS3Credentials = z.infer<typeof AwsS3CredentialsSchema>;

/**
 * SDK configuration type for the entire SDK.
 */
export type SdkConfig = z.infer<typeof SdkConfigSchema>;
