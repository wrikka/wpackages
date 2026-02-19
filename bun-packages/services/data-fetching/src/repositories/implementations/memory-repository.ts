/**
 * Memory repository implementation
 * In-memory data storage implementation
 */

import type { BaseRepository } from '../interfaces'

export class MemoryRepository<TData> implements BaseRepository<TData> {
  private data: Map<string, TData> = new Map()

  async find(id: string): Promise<TData | null> {
    return this.data.get(id) ?? null
  }

  async findAll(): Promise<TData[]> {
    return Array.from(this.data.values())
  }

  async create(data: TData): Promise<TData> {
    const id = this.generateId()
    const itemWithId = { ...data, id } as TData & { id: string }
    this.data.set(id, itemWithId as TData)
    return itemWithId as TData
  }

  async update(id: string, data: Partial<TData>): Promise<TData> {
    const existing = this.data.get(id)
    if (!existing) {
      throw new Error(`Item with id ${id} not found`)
    }
    
    const updated = { ...existing, ...data }
    this.data.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
