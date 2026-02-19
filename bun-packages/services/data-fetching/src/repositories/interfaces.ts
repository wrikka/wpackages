/**
 * Repository interfaces
 * Abstract contracts for data access
 */

import type { CacheEntry } from '../types'

export interface BaseRepository<TData = unknown, _TError = Error> {
  find(id: string): Promise<TData | null>
  findAll(): Promise<TData[]>
  create(data: TData): Promise<TData>
  update(id: string, data: Partial<TData>): Promise<TData>
  delete(id: string): Promise<boolean>
}

export interface CacheRepository<TData = unknown> {
  get(key: string): Promise<TData | null>
  set(key: string, data: TData, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  getEntry(key: string): Promise<CacheEntry<TData> | null>
}

export interface HTTPRepository<TData = unknown> {
  get(url: string, options?: RequestInit): Promise<TData>
  post(url: string, data?: unknown, options?: RequestInit): Promise<TData>
  put(url: string, data?: unknown, options?: RequestInit): Promise<TData>
  patch(url: string, data?: unknown, options?: RequestInit): Promise<TData>
  delete(url: string, options?: RequestInit): Promise<TData>
}
