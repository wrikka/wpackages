import { z } from 'zod';
import { AwsEc2CredentialsSchema } from '../schemas/aws-ec2';

/**
 * AWS EC2 specific credentials type.
 */
export type AwsEc2Credentials = z.infer<typeof AwsEc2CredentialsSchema>;
