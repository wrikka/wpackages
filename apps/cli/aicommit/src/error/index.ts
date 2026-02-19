/**
 * Error handling utilities for aicommit
 */

export class AicommitError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AicommitError';
  }
}

export class ConfigError extends AicommitError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

export class LLMError extends AicommitError {
  constructor(message: string, details?: unknown) {
    super(message, 'LLM_ERROR', details);
    this.name = 'LLMError';
  }
}

export class GitError extends AicommitError {
  constructor(message: string, details?: unknown) {
    super(message, 'GIT_ERROR', details);
    this.name = 'GitError';
  }
}

export function handleError(error: unknown): void {
  if (error instanceof AicommitError) {
    console.error(`${error.name}: ${error.message}`);
    if (error.details) {
      console.error('Details:', error.details);
    }
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`);
  } else {
    console.error('Unknown error occurred:', error);
  }
}
