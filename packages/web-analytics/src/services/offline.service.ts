import { Effect } from 'effect';
import { Event } from '../types/analytics.js';

export interface OfflineQueueConfig {
  enabled: boolean;
  storageKey: string;
  maxStorageSize: number;
}

export class OfflineQueue {
  private config: OfflineQueueConfig;
  private queue: Event[] = [];

  constructor(config: OfflineQueueConfig) {
    this.config = config;
    this.loadFromStorage();
  }

  private loadFromStorage(): Effect.Effect<void, never> {
    return Effect.try(() => {
      if (typeof window === 'undefined' || !this.config.enabled) return;
      
      try {
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      } catch {
        this.queue = [];
      }
    });
  }

  private saveToStorage(): Effect.Effect<void, never> {
    return Effect.try(() => {
      if (typeof window === 'undefined' || !this.config.enabled) return;
      
      try {
        const jsonString = JSON.stringify(this.queue);
        const size = new Blob([jsonString]).size;
        
        if (size > this.config.maxStorageSize) {
          this.queue = this.queue.slice(-100);
        }
        
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.queue));
      } catch {
        localStorage.removeItem(this.config.storageKey);
      }
    });
  }

  add(event: Event): Effect.Effect<void, never> {
    return Effect.sync(() => {
      this.queue.push(event);
      Effect.runPromise(this.saveToStorage());
    });
  }

  remove(count: number): Effect.Effect<Event[], never> {
    return Effect.sync(() => {
      const removed = this.queue.splice(0, count);
      Effect.runPromise(this.saveToStorage());
      return removed;
    });
  }

  peek(count: number): Effect.Effect<Event[], never> {
    return Effect.sync(() => this.queue.slice(0, count));
  }

  size(): Effect.Effect<number, never> {
    return Effect.sync(() => this.queue.length);
  }

  clear(): Effect.Effect<void, never> {
    return Effect.sync(() => {
      this.queue = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.config.storageKey);
      }
    });
  }

  isEmpty(): Effect.Effect<boolean, never> {
    return Effect.sync(() => this.queue.length === 0);
  }
}
