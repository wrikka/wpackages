/**
 * HTTP repository implementation
 * HTTP-based data access implementation
 */

import type { HTTPRepository } from '../interfaces'

export class HTTPRepositoryImpl<TData = unknown> implements HTTPRepository<TData> {
  constructor(private baseURL: string = '') { }

  async get(url: string, options?: RequestInit): Promise<TData> {
    return this.request<TData>('GET', url, undefined, options)
  }

  async post(url: string, data?: unknown, options?: RequestInit): Promise<TData> {
    return this.request<TData>('POST', url, data, options)
  }

  async put(url: string, data?: unknown, options?: RequestInit): Promise<TData> {
    return this.request<TData>('PUT', url, data, options)
  }

  async patch(url: string, data?: unknown, options?: RequestInit): Promise<TData> {
    return this.request<TData>('PATCH', url, data, options)
  }

  async delete(url: string, options?: RequestInit): Promise<TData> {
    return this.request<TData>('DELETE', url, undefined, options)
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : null,
      ...options,
    }

    const response = await fetch(fullUrl, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
