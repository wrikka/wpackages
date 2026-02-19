/**
 * Storage service for browser extension
 */

export class StorageService {
  private static instance: StorageService

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  async get<T = any>(keys: string | string[]): Promise<{ [key: string]: T }> {
    try {
      return await browser.storage.local.get(keys)
    } catch (error) {
      console.error('Failed to get from storage:', error)
      return {}
    }
  }

  async set(items: { [key: string]: any }): Promise<boolean> {
    try {
      await browser.storage.local.set(items)
      return true
    } catch (error) {
      console.error('Failed to set to storage:', error)
      return false
    }
  }

  async remove(keys: string | string[]): Promise<boolean> {
    try {
      await browser.storage.local.remove(keys)
      return true
    } catch (error) {
      console.error('Failed to remove from storage:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      await browser.storage.local.clear()
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  }

  async getBytesInUse(): Promise<number> {
    try {
      return await browser.storage.local.getBytesInUse()
    } catch (error) {
      console.error('Failed to get bytes in use:', error)
      return 0
    }
  }
}

export const storageService = StorageService.getInstance()
