import type { HTTPAdapter, RequestConfig } from '../types'
import { buildURL, mergeHeaders, parseResponse } from '../utils'
import { NetworkError, TimeoutError, DataFetchingError } from '../error'

export class FetchAdapter implements HTTPAdapter {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number

  constructor(config: { baseURL?: string; timeout?: number; headers?: Record<string, string> } = {}) {
    this.baseURL = config.baseURL || ''
    this.defaultHeaders = config.headers || {}
    this.timeout = config.timeout || 10000
  }

  private async request<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
    const fullURL = buildURL(this.baseURL, url, config.params)
    const headers = mergeHeaders(this.defaultHeaders, config.headers || {})

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(fullURL, {
        method: config.method || 'GET',
        headers,
        body: config.data ? JSON.stringify(config.data) : config.body || null,
        signal: controller.signal,
        ...Object.fromEntries(
          Object.entries(config).filter(([key]) => !['method', 'headers', 'params', 'data', 'body'].includes(key))
        )
      } as RequestInit)

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new DataFetchingError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          undefined,
          response
        )
      }

      return await parseResponse<T>(response)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof DataFetchingError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(this.timeout)
        }
        throw new NetworkError(error.message, error)
      }

      throw new DataFetchingError('Unknown error occurred')
    }
  }

  async get<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T = unknown>(url: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', data })
  }

  async put<T = unknown>(url: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', data })
  }

  async patch<T = unknown>(url: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', data })
  }

  async delete<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}
