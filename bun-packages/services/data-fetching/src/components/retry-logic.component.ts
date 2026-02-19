export class RetryLogic {
  static shouldRetry(attempt: number, maxRetries: number, error: Error): boolean {
    if (attempt >= maxRetries) return false
    
    // Don't retry on client errors (4xx)
    if ('status' in error && typeof error.status === 'number') {
      return error.status >= 500
    }
    
    // Retry on network errors
    return error.name === 'NetworkError' || error.name === 'TimeoutError'
  }

  static calculateDelay(attempt: number, baseDelay: number): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000)
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
