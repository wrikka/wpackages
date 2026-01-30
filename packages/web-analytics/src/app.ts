import { Effect } from 'effect';
import { Event, AnalyticsConfig, EventMiddleware, ContextProvider, EventFilter, NetworkStatus } from './types/analytics.js';
import { validateEvent, sendEventsBatched } from './services/analytics.service.js';
import { MiddlewareManager } from './services/middleware.service.js';
import { ContextManager } from './services/context.service.js';
import { FilterManager } from './services/filter.service.js';
import { shouldSampleEvent, markEventAsSampled } from './services/sampling.service.js';
import { NetworkAwareness } from './services/network.service.js';
import { OfflineQueue } from './services/offline.service.js';
import { AutoTracker, type AutoTrackingConfig } from './services/auto-tracking.service.js';
import { SessionManager } from './services/session.service.js';
import { FunnelTracker, type FunnelConfig, CohortTracker, type CohortConfig } from './services/analytics-advanced.service.js';
import { ABTestingTracker, type Experiment } from './services/ab-testing.service.js';
import { AnalyticsConfigError } from './error.js';

export class AnalyticsClient {
  private queue: Event[] = [];
  private config: AnalyticsConfig;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private middlewareManager: MiddlewareManager;
  private contextManager: ContextManager;
  private filterManager: FilterManager;
  private networkAwareness: NetworkAwareness;
  private offlineQueue: OfflineQueue;
  private autoTracker: AutoTracker | null = null;
  private sessionManager: SessionManager | null = null;
  private funnelTracker: FunnelTracker | null = null;
  private cohortTracker: CohortTracker | null = null;
  private abTestingTracker: ABTestingTracker | null = null;
  private destroyed: boolean = false;

  constructor(config: AnalyticsConfig) {
    if (!config.apiKey) {
      throw new AnalyticsConfigError('API key is required');
    }

    this.config = this.normalizeConfig(config);
    this.middlewareManager = new MiddlewareManager();
    this.contextManager = new ContextManager();
    this.filterManager = new FilterManager();
    this.networkAwareness = new NetworkAwareness();
    this.offlineQueue = new OfflineQueue({
      enabled: this.config.enableOffline ?? false,
      storageKey: this.config.offlineStorageKey ?? 'analytics-offline-queue',
      maxStorageSize: this.config.maxOfflineStorage ?? 1024 * 1024,
    });

    this.setupDefaultProviders();
    this.initializeAdvancedServices();
    this.startFlushTimer();
    this.setupNetworkListener();
  }

  private normalizeConfig(config: AnalyticsConfig): AnalyticsConfig {
    return {
      ...config,
      requestTimeout: config.requestTimeout ?? 5000,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      maxQueueSize: config.maxQueueSize ?? 100,
      enableCompression: config.enableCompression ?? false,
      compressionThreshold: config.compressionThreshold ?? 1024,
      enableSampling: config.enableSampling ?? false,
      samplingRate: config.samplingRate ?? 1.0,
      importantEvents: config.importantEvents ?? [],
      enableOffline: config.enableOffline ?? false,
      offlineStorageKey: config.offlineStorageKey ?? 'analytics-offline-queue',
      maxOfflineStorage: config.maxOfflineStorage ?? 1024 * 1024,
      enableMiddleware: config.enableMiddleware ?? true,
      enableContextEnrichment: config.enableContextEnrichment ?? true,
      enableFiltering: config.enableFiltering ?? true,
      enableNetworkAwareness: config.enableNetworkAwareness ?? true,
    };
  }

  private setupDefaultProviders(): void {
    if (this.config.enableFiltering) {
      if (this.config.blockedEvents && this.config.blockedEvents.length > 0) {
        this.filterManager.add({
          name: 'blocklist',
          shouldBlock: (event) => this.config.blockedEvents!.includes(event.name),
        });
      }
      if (this.config.allowedEvents && this.config.allowedEvents.length > 0) {
        this.filterManager.add({
          name: 'allowlist',
          shouldBlock: (event) => !this.config.allowedEvents!.includes(event.name),
        });
      }
    }
  }

  private initializeAdvancedServices(): void {
    this.sessionManager = new SessionManager({
      sessionTimeout: 30 * 60 * 1000,
      enableSessionTracking: true,
    });

    this.funnelTracker = new FunnelTracker();
    this.cohortTracker = new CohortTracker();
    this.abTestingTracker = new ABTestingTracker();
  }

  private setupNetworkListener(): void {
    if (this.config.enableNetworkAwareness) {
      this.networkAwareness.onStatusChange((status: NetworkStatus) => {
        if (status.online && this.config.enableOffline) {
          this.syncOfflineEvents();
        }
      });
    }
  }

  private syncOfflineEvents(): void {
    Effect.runPromise(
      Effect.flatMap(
        this.offlineQueue.size(),
        (size) => {
          if (size === 0) return Effect.void;
          return Effect.flatMap(
            this.offlineQueue.remove(size),
            (events) => {
              if (events.length === 0) return Effect.void;
              return sendEventsBatched(
                this.config.endpoint,
                this.config.apiKey,
                events,
                this.config.batchSize,
                this.config.requestTimeout ?? 5000,
                this.config.enableCompression ?? false,
                this.config.compressionThreshold ?? 1024,
              );
            },
          );
        },
      ),
    ).catch((error) => {
      if (this.config.enableDebug) {
        console.error('Failed to sync offline events:', error);
      }
    });
  }

  track(event: Event): Effect.Effect<void, Error> {
    if (this.destroyed) {
      return Effect.fail(new Error('AnalyticsClient has been destroyed'));
    }

    return Effect.gen(function* () {
      const validatedEvent = yield* validateEvent(event);

      if (yield* this.filterManager.shouldBlock(validatedEvent)) {
        if (this.config.enableDebug) {
          console.log(`Event blocked: ${validatedEvent.name}`);
        }
        return;
      }

      let processedEvent = validatedEvent;

      if (this.config.enableContextEnrichment) {
        processedEvent = yield* this.contextManager.enrich(processedEvent);
      }

      if (this.config.enableMiddleware) {
        const middlewareResult = yield* this.middlewareManager.process(processedEvent);
        if (middlewareResult === null) {
          if (this.config.enableDebug) {
            console.log(`Event filtered by middleware: ${processedEvent.name}`);
          }
          return;
        }
        processedEvent = middlewareResult;
      }

      if (this.config.enableSampling) {
        const sampled = yield* shouldSampleEvent(
          processedEvent,
          {
            enabled: true,
            rate: this.config.samplingRate ?? 1.0,
            importantEvents: this.config.importantEvents ?? [],
          },
        );
        processedEvent = markEventAsSampled(processedEvent, sampled);
        if (!sampled) {
          if (this.config.enableDebug) {
            console.log(`Event sampled out: ${processedEvent.name}`);
          }
          return;
        }
      }

      if (this.config.enableOffline && !this.networkAwareness.isOnline()) {
        yield* this.offlineQueue.add(processedEvent);
        if (this.config.enableDebug) {
          console.log(`Event queued offline: ${processedEvent.name}`);
        }
        return;
      }

      this.addToQueue(processedEvent);

      if (this.queue.length >= this.config.batchSize) {
        yield* this.flush();
      }
    }.bind(this));
  }

  trackBatch(events: Event[]): Effect.Effect<void, Error> {
    return Effect.all(events.map((event) => this.track(event)), { concurrency: 'unbounded' });
  }

  identify(userId: string, traits?: Record<string, unknown>): Effect.Effect<void, Error> {
    return this.track({
      name: 'identify',
      properties: { userId, ...traits },
      priority: 'high',
    });
  }

  private addToQueue(event: Event): void {
    const maxQueueSize = this.config.maxQueueSize ?? 100;
    
    if (this.queue.length >= maxQueueSize) {
      const priority = event.priority ?? 'medium';
      const lowestPriorityIndex = this.queue.findIndex(
        (e) => (e.priority ?? 'medium') === 'low',
      );
      
      if (lowestPriorityIndex !== -1 && priority !== 'low') {
        this.queue.splice(lowestPriorityIndex, 1);
        this.queue.push(event);
      }
    } else {
      this.queue.push(event);
    }
  }

  flush(): Effect.Effect<void, Error> {
    if (this.queue.length === 0) {
      return Effect.void;
    }

    const eventsToFlush = [...this.queue];
    this.queue = [];

    return Effect.gen(function* () {
      if (this.config.enableOffline && !this.networkAwareness.isOnline()) {
        for (const event of eventsToFlush) {
          yield* this.offlineQueue.add(event);
        }
        if (this.config.enableDebug) {
          console.log(`Flushed ${eventsToFlush.length} events to offline queue`);
        }
        return;
      }

      const batchSize = this.config.enableNetworkAwareness
        ? yield* this.networkAwareness.getOptimalBatchSize()
        : this.config.batchSize;

      yield* sendEventsBatched(
        this.config.endpoint,
        this.config.apiKey,
        eventsToFlush,
        batchSize,
        this.config.requestTimeout ?? 5000,
        this.config.enableCompression ?? false,
        this.config.compressionThreshold ?? 1024,
      );

      if (this.config.enableDebug) {
        console.log(`Flushed ${eventsToFlush.length} events successfully`);
      }
    }.bind(this));
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      Effect.runPromise(this.flush()).catch((error) => {
        if (this.config.enableDebug) {
          console.error('Failed to flush analytics:', error);
        }
      });
    }, this.config.flushInterval);
  }

  addMiddleware(middleware: EventMiddleware): void {
    this.middlewareManager.add(middleware);
  }

  addContextProvider(provider: ContextProvider): void {
    this.contextManager.add(provider);
  }

  addFilter(filter: EventFilter): void {
    this.filterManager.add(filter);
  }

  isOnline(): boolean {
    return this.networkAwareness.isOnline();
  }

  getNetworkStatus(): NetworkStatus {
    return this.networkAwareness.getStatus();
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getOfflineQueueSize(): Effect.Effect<number, Error> {
    return this.offlineQueue.size();
  }

  enableAutoTracking(config: AutoTrackingConfig): void {
    if (this.autoTracker) {
      this.autoTracker.destroy();
    }
    this.autoTracker = new AutoTracker(config, (event: Event) => {
      Effect.runPromise(this.track(event)).catch((error: unknown) => {
        if (this.config.enableDebug) {
          console.error('Failed to track auto event:', error);
        }
      });
    });
    this.autoTracker.initialize();
  }

  disableAutoTracking(): void {
    if (this.autoTracker) {
      this.autoTracker.destroy();
      this.autoTracker = null;
    }
  }

  getSessionId(): string | null {
    return this.sessionManager?.getSessionId() ?? null;
  }

  getSessionInfo(): { sessionId: string | null; duration: number; startTime: number | null } | null {
    return this.sessionManager?.getSessionInfo() ?? null;
  }

  addFunnel(config: FunnelConfig): void {
    this.funnelTracker?.addFunnel(config);
  }

  getFunnelProgress(funnelName: string): { completed: number; total: number; percentage: number } | null {
    return this.funnelTracker?.getFunnelProgress(funnelName) ?? null;
  }

  resetFunnel(funnelName: string): void {
    this.funnelTracker?.resetFunnel(funnelName);
  }

  addCohort(config: CohortConfig): void {
    this.cohortTracker?.addCohort(config);
  }

  getCohortSize(cohortName: string): number {
    return this.cohortTracker?.getCohortSize(cohortName) ?? 0;
  }

  addExperiment(experiment: Experiment): void {
    this.abTestingTracker?.addExperiment(experiment);
  }

  assignVariant(experimentId: string, userId: string) {
    return this.abTestingTracker?.assignVariant(experimentId, userId) ?? null;
  }

  trackExperimentExposure(experimentId: string, userId: string): void {
    this.abTestingTracker?.trackExposure(experimentId, userId, (event: Event) => {
      Effect.runPromise(this.track(event)).catch((error: unknown) => {
        if (this.config.enableDebug) {
          console.error('Failed to track experiment exposure:', error);
        }
      });
    });
  }

  trackExperimentConversion(experimentId: string, userId: string): void {
    this.abTestingTracker?.trackConversion(experimentId, userId, (event: Event) => {
      Effect.runPromise(this.track(event)).catch((error: unknown) => {
        if (this.config.enableDebug) {
          console.error('Failed to track experiment conversion:', error);
        }
      });
    });
  }

  getExperiment(experimentId: string) {
    return this.abTestingTracker?.getExperiment(experimentId) ?? null;
  }

  destroy(): void {
    this.destroyed = true;
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    Effect.runPromise(this.flush()).catch((error: unknown) => {
      if (this.config.enableDebug) {
        console.error('Failed to flush on destroy:', error);
      }
    });

    this.middlewareManager.clear();
    this.contextManager.clear();
    this.filterManager.clear();
  }
}
