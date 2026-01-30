import { Effect } from 'effect';
import { Event, EventBatch } from '../types/analytics.js';
import { generateEventId, generateBatchId, formatTimestamp, sanitizeEventName, isValidEventName, chunkEvents } from '../utils/event-utils.js';
import { AnalyticsValidationError, AnalyticsNetworkError } from '../error.js';
import { compressEventBatch } from './compression.service.js';

export const validateEvent = (event: Event): Effect.Effect<Event, AnalyticsValidationError> => {
  if (!event.name || typeof event.name !== 'string') {
    return Effect.fail(new AnalyticsValidationError('Event name is required and must be a string'));
  }

  if (!isValidEventName(event.name)) {
    return Effect.fail(new AnalyticsValidationError(`Invalid event name: ${event.name}`));
  }

  const sanitizedEvent = {
    ...event,
    name: sanitizeEventName(event.name),
    timestamp: formatTimestamp(event.timestamp),
    eventId: event.eventId ?? generateEventId(),
  };

  return Effect.succeed(sanitizedEvent);
};

export const createEventBatch = (events: Event[], _batchSize: number): EventBatch => {
  return {
    events,
    batchId: generateBatchId(),
    sentAt: Date.now(),
  };
};

export const sendEvents = (
  endpoint: string,
  apiKey: string,
  batch: EventBatch,
  timeout: number = 5000,
): Effect.Effect<void, AnalyticsNetworkError> =>
  Effect.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(batch),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
    },
    catch: (unknown: unknown) => new AnalyticsNetworkError(`Failed to send events: ${unknown}`),
  });

export const sendEventsBatched = (
  endpoint: string,
  apiKey: string,
  events: Event[],
  batchSize: number,
  timeout: number = 5000,
  enableCompression: boolean = false,
  compressionThreshold: number = 1024,
): Effect.Effect<void, AnalyticsNetworkError | AnalyticsValidationError> =>
  Effect.all(
    chunkEvents(events, batchSize).map((chunk) =>
      Effect.flatMap(
        Effect.all(chunk.map(validateEvent)),
        (validatedEvents: Event[]) => {
          const batch = createEventBatch(validatedEvents, batchSize);
          
          return Effect.tryPromise({
            try: async () => {
              let payload: EventBatch | Uint8Array = batch;
              if (enableCompression) {
                payload = await compressEventBatch(batch, compressionThreshold);
              }
              
              if (payload instanceof Uint8Array) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                try {
                  const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/octet-stream',
                      'Content-Encoding': 'gzip',
                      'Authorization': `Bearer ${apiKey}`,
                    },
                    body: payload.buffer as ArrayBuffer,
                    signal: controller.signal,
                  });
                  
                  clearTimeout(timeoutId);
                  
                  if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                  }
                } catch (error) {
                  clearTimeout(timeoutId);
                  if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error(`Request timeout after ${timeout}ms`);
                  }
                  throw error;
                }
              } else {
                return Effect.runPromise(sendEvents(endpoint, apiKey, payload, timeout));
              }
            },
            catch: (unknown: unknown) => {
              throw new AnalyticsNetworkError(`Failed to send events: ${unknown}`);
            },
          });
        },
      ),
    ),
    { concurrency: 'unbounded' },
  );
