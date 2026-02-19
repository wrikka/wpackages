/**
 * Type definitions for the integrations package.
 */

// Schemas
export { BaseServiceCredentialsSchema } from './schemas';
export { ServiceConfigSchema, SdkConfigSchema } from './schemas/service';
export { AwsS3CredentialsSchema } from './schemas/aws';
export { AwsEc2CredentialsSchema } from './schemas/aws-ec2';
export { Auth0CredentialsSchema } from './schemas/auth0';

// Types
export { BaseServiceCredentials, ServiceConfig } from './types/base';
export { Integration, ConnectedClient } from './types/integration';
export { AwsS3Credentials, SdkConfig } from './types/aws';
export { AwsEc2Credentials } from './types/aws-ec2';
export { Auth0Credentials } from './types/auth0';

// Enums
export { Service } from './enums';
