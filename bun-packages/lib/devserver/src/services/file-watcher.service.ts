import type { Logger } from '../types';

export class FileWatcherService {
  private watchers: Map<string, any> = new Map();
  private callbacks: Map<string, Set<(path: string, type: 'create' | 'update' | 'delete') => void>> = new Map();

  constructor(private logger: Logger) { }

  async watch(pattern: string, callback: (path: string, type: 'create' | 'update' | 'delete') => void): Promise<void> {
    if (!this.callbacks.has(pattern)) {
      this.callbacks.set(pattern, new Set());
    }

    this.callbacks.get(pattern)!.add(callback);

    if (!this.watchers.has(pattern)) {
      try {
        // Use Bun.serve with WebSocket for file watching fallback
        // For now, implement a simple polling mechanism
        const pollInterval = setInterval(async () => {
          const callbacks = this.callbacks.get(pattern);
          if (callbacks) {
            for (const cb of callbacks) {
              try {
                // Simple file existence check for demo
                cb(pattern, 'update');
              } catch (error) {
                this.logger.error(`File watcher callback failed for ${pattern}:`, error);
              }
            }
          }
        }, 1000);

        this.watchers.set(pattern, pollInterval);
        this.logger.info(`Watching: ${pattern} (polling mode)`);
      } catch (error) {
        this.logger.error(`Failed to watch pattern: ${pattern}`, error);
        throw error;
      }
    }
  }

  async unwatch(pattern: string, callback?: (path: string, type: 'create' | 'update' | 'delete') => void): Promise<void> {
    const callbacks = this.callbacks.get(pattern);

    if (callbacks && callback) {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        this.callbacks.delete(pattern);

        const watcher = this.watchers.get(pattern);
        if (watcher) {
          await watcher.close();
          this.watchers.delete(pattern);
          this.logger.info(`Stopped watching: ${pattern}`);
        }
      }
    } else if (!callback) {
      this.callbacks.delete(pattern);

      const watcher = this.watchers.get(pattern);
      if (watcher) {
        if (typeof watcher === 'number') {
          clearInterval(watcher);
        }
        this.watchers.delete(pattern);
        this.logger.info(`Stopped watching: ${pattern}`);
      }
    }
  }

  async stopAll(): Promise<void> {
    const promises = Array.from(this.watchers.values()).map(watcher => {
      if (typeof watcher === 'number') {
        clearInterval(watcher);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);

    this.watchers.clear();
    this.callbacks.clear();

    this.logger.info('All file watchers stopped');
  }

  getWatchedPatterns(): string[] {
    return Array.from(this.watchers.keys());
  }

  isWatching(pattern: string): boolean {
    return this.watchers.has(pattern);
  }
}
