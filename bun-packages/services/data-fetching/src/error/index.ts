export class DataFetchingError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly response?: Response
  ) {
    super(message)
    this.name = 'DataFetchingError'
  }
}

export class NetworkError extends DataFetchingError {
  constructor(message: string, public readonly originalError: Error) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends DataFetchingError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`)
    this.name = 'TimeoutError'
  }
}

export class CacheError extends DataFetchingError {
  constructor(message: string, public readonly operation: string) {
    super(message)
    this.name = 'CacheError'
  }
}

export class ValidationError extends DataFetchingError {
  constructor(message: string, public readonly field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function isDataFetchingError(error: unknown): error is DataFetchingError {
  return error instanceof DataFetchingError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}

export function isCacheError(error: unknown): error is CacheError {
  return error instanceof CacheError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
