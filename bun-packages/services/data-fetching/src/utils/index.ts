export function generateQueryKey(key: readonly unknown[]): string {
  return JSON.stringify(key)
}

export function isExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl
}

export function createRetryDelay(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000)
}

export function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  
  if (contentType?.includes('text/')) {
    return response.text() as Promise<T>
  }
  
  return response.blob() as Promise<T>
}

export function buildURL(baseURL: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, baseURL)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value)
      }
    })
  }
  
  return url.toString()
}

export function mergeHeaders(...headers: (Record<string, string> | HeadersInit)[]): Record<string, string> {
  const merged: Record<string, string> = {}
  
  headers.forEach(header => {
    if (header instanceof Headers) {
      header.forEach((value, key) => {
        merged[key] = value
      })
    } else if (typeof header === 'object') {
      Object.assign(merged, header)
    }
  })
  
  return merged
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((val, index) => deepEqual(val, b[index]))
  }
  
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    return keysA.length === keysB.length && 
           keysA.every(key => keysB.includes(key) && deepEqual(a[key], b[key]))
  }
  
  return false
}
