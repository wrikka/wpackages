/**
 * Request utilities - Pure functional approach
 */

import type { Request } from '../types'

// URL parsing utilities
export const parseUrl = (url: string) => {
  try {
    return new URL(url)
  } catch {
    // Return a safe fallback URL object
    return {
      pathname: url,
      protocol: 'http:',
      hostname: 'localhost',
      search: '',
      searchParams: new URLSearchParams()
    } as URL
  }
}

// Pure function for request creation
export const createRequest = (
  id: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: any,
  query?: Record<string, string>,
  params?: Record<string, string>
): Request => {
  const parsedUrl = parseUrl(url)
  
  return {
    id,
    method,
    url,
    path: parsedUrl.pathname,
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    headers,
    body,
    query: query || {},
    params: params || {},
    startTime: performance.now()
  }
}

// Request validation
export const validateRequest = (req: Request): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!req.method) {
    errors.push('Method is required')
  }

  if (!req.url) {
    errors.push('URL is required')
  }

  if (!req.headers) {
    errors.push('Headers are required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Request utilities
export const getClientId = (req: Request): string => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.headers['x-client-ip'] ||
         'unknown'
}

export const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown'
}

export const getContentType = (req: Request): string => {
  return req.headers['content-type'] || 'application/json'
}

export const getContentLength = (req: Request): number => {
  const length = req.headers['content-length']
  return length ? parseInt(length, 10) : 0
}

export const isJsonRequest = (req: Request): boolean => {
  return getContentType(req).includes('application/json')
}

export const isFormRequest = (req: Request): boolean => {
  return getContentType(req).includes('application/x-www-form-urlencoded')
}

export const isMultipartRequest = (req: Request): boolean => {
  return getContentType(req).includes('multipart/form-data')
}

export const isSecureRequest = (req: Request): boolean => {
  return req.protocol === 'https:' || req.headers['x-forwarded-proto'] === 'https'
}

export const getRequestInfo = (req: Request) => ({
  id: req.id,
  method: req.method,
  url: req.url,
  path: req.path,
  protocol: req.protocol,
  hostname: req.hostname,
  contentType: getContentType(req),
  contentLength: getContentLength(req),
  userAgent: getUserAgent(req),
  clientId: getClientId(req),
  isSecure: isSecureRequest(req),
  isJson: isJsonRequest(req),
  isForm: isFormRequest(req),
  isMultipart: isMultipartRequest(req),
  startTime: req.startTime
})
