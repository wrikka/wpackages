export interface Event {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  eventId?: string;
  priority?: 'low' | 'medium' | 'high';
  sampled?: boolean;
}

export interface EventBatch {
  events: Event[];
  batchId: string;
  sentAt: number;
}

export interface AnalyticsConfig {
  apiKey: string;
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  enableDebug: boolean;
  requestTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  maxQueueSize?: number;
  enableCompression?: boolean;
  compressionThreshold?: number;
  enableSampling?: boolean;
  samplingRate?: number;
  importantEvents?: string[];
  enableOffline?: boolean;
  offlineStorageKey?: string;
  maxOfflineStorage?: number;
  enableMiddleware?: boolean;
  enableContextEnrichment?: boolean;
  enableFiltering?: boolean;
  blockedEvents?: string[];
  allowedEvents?: string[];
  enableNetworkAwareness?: boolean;
}

export interface AnalyticsClient {
  track(event: Event): Effect.Effect<void, Error>;
  trackBatch(events: Event[]): Effect.Effect<void, Error>;
  identify(userId: string, traits?: Record<string, unknown>): Effect.Effect<void, Error>;
  flush(): Effect.Effect<void, Error>;
  destroy(): void;
  addMiddleware(middleware: EventMiddleware): void;
  addContextProvider(provider: ContextProvider): void;
  addFilter(filter: EventFilter): void;
  isOnline(): boolean;
}

export interface EventMiddleware {
  name: string;
  process(event: Event): Event | null;
}

export interface ContextProvider {
  name: string;
  getContext(): Record<string, unknown>;
}

export interface EventFilter {
  name: string;
  shouldBlock(event: Event): boolean;
}

export interface NetworkStatus {
  online: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}
