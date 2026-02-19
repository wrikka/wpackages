// Shared utility functions for AI engines

export function createError(message: string, code?: string) {
  return {
    success: false,
    error: {
      message,
      code: code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }
  }
}

export function createSuccess<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function validateRequest(request: any, requiredFields: string[]): string[] {
  const missing = []
  
  for (const field of requiredFields) {
    if (!request[field]) {
      missing.push(field)
    }
  }
  
  return missing
}

export function sanitizeCode(code: string): string {
  // Remove sensitive information and clean up code
  return code
    .replace(/password\s*=\s*['"`][^'"`]+['"`]/gi, 'password = "***"')
    .replace(/api[_-]?key\s*=\s*['"`][^'"`]+['"`]/gi, 'apiKey = "***"')
    .replace(/secret\s*=\s*['"`][^'"`]+['"`]/gi, 'secret = "***"')
    .replace(/token\s*=\s*['"`][^'"`]+['"`]/gi, 'token = "***"')
}

export function extractLanguageFromCode(code: string): string {
  // Simple language detection based on code patterns
  if (code.includes('def ') && code.includes(':')) return 'python'
  if (code.includes('func ') && code.includes('{')) return 'go'
  if (code.includes('package ') && code.includes('import')) return 'java'
  if (code.includes('public class ')) return 'java'
  if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript'
  if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) return 'typescript'
  
  return 'unknown'
}

export function calculateComplexity(code: string): number {
  // Simple complexity calculation based on cyclomatic complexity
  let complexity = 1 // Base complexity
  
  // Count decision points
  complexity += (code.match(/if\s*\(/g) || []).length
  complexity += (code.match(/else\s+if\s*\(/g) || []).length
  complexity += (code.match(/case\s+/g) || []).length
  complexity += (code.match(/while\s*\(/g) || []).length
  complexity += (code.match(/for\s*\(/g) || []).length
  complexity += (code.match(/catch\s*\(/g) || []).length
  complexity += (code.match(/\?\s*[^:]+:/g) || []).length
  
  return complexity
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
