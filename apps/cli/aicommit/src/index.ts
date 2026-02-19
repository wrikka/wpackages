/**
 * Main entry point barrel exports
 */

// Types
export * from './types/config';

// Constants
export * from './constants';

// Error handling
export * from './error';

// Configuration
export * from './config';

// Library utilities
export * from './lib';

// Services
export * from './services';

// Legacy exports for compatibility
export * from './utils/config';
export * from './utils/git';
// Note: formatCommitMessage is already exported from lib, so we skip utils/commit to avoid conflict
export * from './llm/providers';
