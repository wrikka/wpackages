/**
 * Response utilities - Pure functional approach
 */

import type { Response } from '../types'

// Pure function for response creation
export const createResponse = (
  status: number = 200,
  headers: Record<string, string> = {},
  body?: any
): Response => ({
  status,
  headers: {
    'content-type': 'application/json',
    ...headers
  },
  body,
  sent: false,
  startTime: performance.now()
})

// Response update utilities
export const updateResponse = (
  response: Response,
  updates: Partial<Response>
): Response => ({
  ...response,
  ...updates,
  headers: {
    ...response.headers,
    ...updates.headers
  }
})

export const setStatus = (response: Response, status: number): Response => 
  updateResponse(response, { status })

export const setHeader = (response: Response, name: string, value: string): Response => 
  updateResponse(response, { 
    headers: { ...response.headers, [name]: value } 
  })

export const setHeaders = (response: Response, headers: Record<string, string>): Response => 
  updateResponse(response, { 
    headers: { ...response.headers, ...headers } 
  })

export const setBody = (response: Response, body: any): Response => 
  updateResponse(response, { body })

export const markSent = (response: Response): Response => 
  updateResponse(response, { sent: true })

// Response validation
export const validateResponse = (res: Response): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof res.status !== 'number' || res.status < 100 || res.status > 599) {
    errors.push('Status must be a valid HTTP status code')
  }

  if (!res.headers || typeof res.headers !== 'object') {
    errors.push('Headers must be an object')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Response helpers
export const json = (data: any, status: number = 200): Response => 
  createResponse(status, { 'content-type': 'application/json' }, data)

export const text = (data: string, status: number = 200): Response => 
  createResponse(status, { 'content-type': 'text/plain' }, data)

export const html = (data: string, status: number = 200): Response => 
  createResponse(status, { 'content-type': 'text/html' }, data)

export const redirect = (url: string, status: number = 302): Response => 
  createResponse(status, { location: url })

export const error = (message: string, status: number = 500, details?: any): Response => 
  createResponse(status, {}, {
    error: {
      message,
      status,
      details,
      timestamp: new Date().toISOString()
    }
  })

export const success = (data: any, meta?: any): Response => 
  createResponse(200, {}, {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  })

// Response status helpers
export const ok = (data?: any) => json(data, 200)
export const created = (data?: any) => json(data, 201)
export const noContent = () => createResponse(204)
export const badRequest = (message: string, details?: any) => error(message, 400, details)
export const unauthorized = (message: string = 'Unauthorized') => error(message, 401)
export const forbidden = (message: string = 'Forbidden') => error(message, 403)
export const notFound = (message: string = 'Not Found') => error(message, 404)
export const methodNotAllowed = (message: string = 'Method Not Allowed') => error(message, 405)
export const conflict = (message: string = 'Conflict') => error(message, 409)
export const unprocessableEntity = (message: string = 'Unprocessable Entity') => error(message, 422)
export const tooManyRequests = (message: string = 'Too Many Requests') => error(message, 429)
export const internalServerError = (message: string = 'Internal Server Error') => error(message, 500)
export const notImplemented = (message: string = 'Not Implemented') => error(message, 501)
export const badGateway = (message: string = 'Bad Gateway') => error(message, 502)
export const serviceUnavailable = (message: string = 'Service Unavailable') => error(message, 503)
