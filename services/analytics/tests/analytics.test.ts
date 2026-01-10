import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import { AnalyticsClient } from '../src/app.js';
import { AnalyticsConfigError } from '../src/error.js';

describe('AnalyticsClient', () => {
  let client: AnalyticsClient;
  
  const mockConfig = {
    apiKey: 'test-api-key',
    endpoint: 'https://test.api.com/events',
    batchSize: 5,
    flushInterval: 10000,
    enableDebug: false,
    enableOffline: false,
    enableSampling: false,
    enableMiddleware: false,
    enableContextEnrichment: false,
    enableFiltering: false,
    enableNetworkAwareness: false,
  };

  beforeEach(() => {
    client = new AnalyticsClient(mockConfig);
  });

  describe('Constructor', () => {
    it('should throw error without API key', () => {
      expect(() => {
        new AnalyticsClient({ ...mockConfig, apiKey: '' } as any);
      }).toThrow(AnalyticsConfigError);
    });

    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(AnalyticsClient);
    });

    it('should normalize config with defaults', () => {
      const minimalConfig = {
        apiKey: 'test-key',
        endpoint: 'https://test.com',
        batchSize: 10,
        flushInterval: 30000,
        enableDebug: false,
      };
      const minimalClient = new AnalyticsClient(minimalConfig);
      expect(minimalClient).toBeInstanceOf(AnalyticsClient);
    });
  });

  describe('track', () => {
    it('should track event successfully', async () => {
      const result = await Effect.runPromise(
        client.track({
          name: 'page_view',
          properties: { path: '/home' },
        }),
      );
      expect(result).toBeUndefined();
    });

    it('should track event with priority', async () => {
      const result = await Effect.runPromise(
        client.track({
          name: 'click',
          properties: { button: 'submit' },
          priority: 'high',
        }),
      );
      expect(result).toBeUndefined();
    });

    it('should track identify event', async () => {
      const result = await Effect.runPromise(
        client.identify('user-123', { email: 'test@example.com' }),
      );
      expect(result).toBeUndefined();
    });

    it('should fail when destroyed', async () => {
      client.destroy();
      const result = Effect.runPromise(
        client.track({
          name: 'test',
        }),
      );
      await expect(result).rejects.toThrow('AnalyticsClient has been destroyed');
    });
  });

  describe('trackBatch', () => {
    it('should track multiple events', async () => {
      const events = [
        { name: 'click', properties: { button: 'submit' } },
        { name: 'click', properties: { button: 'cancel' } },
      ];
      const result = await Effect.runPromise(client.trackBatch(events));
      expect(result).toBeUndefined();
    });
  });

  describe('flush', () => {
    it('should flush queue successfully', async () => {
      await Effect.runPromise(
        client.track({
          name: 'test',
        }),
      );
      const result = await Effect.runPromise(client.flush());
      expect(result).toBeUndefined();
    });

    it('should do nothing when queue is empty', async () => {
      const result = await Effect.runPromise(client.flush());
      expect(result).toBeUndefined();
    });
  });

  describe('Queue Management', () => {
    it('should respect max queue size', async () => {
      const smallConfig = { ...mockConfig, maxQueueSize: 3 };
      const smallClient = new AnalyticsClient(smallConfig);

      for (let i = 0; i < 5; i++) {
        await Effect.runPromise(
          smallClient.track({
            name: `test-${i}`,
            priority: 'low',
          }),
        );
      }

      expect(smallClient.getQueueSize()).toBeLessThanOrEqual(3);
    });

    it('should prioritize high priority events', async () => {
      const smallConfig = { ...mockConfig, maxQueueSize: 3 };
      const smallClient = new AnalyticsClient(smallConfig);

      for (let i = 0; i < 3; i++) {
        await Effect.runPromise(
          smallClient.track({
            name: `low-${i}`,
            priority: 'low',
          }),
        );
      }

      await Effect.runPromise(
        smallClient.track({
          name: 'high',
          priority: 'high',
        }),
      );

      expect(smallClient.getQueueSize()).toBe(3);
    });
  });

  describe('Middleware', () => {
    it('should add middleware', () => {
      const middleware = {
        name: 'test-middleware',
        process: (_event: any) => _event,
      };
      client.addMiddleware(middleware);
      expect(client).toBeInstanceOf(AnalyticsClient);
    });
  });

  describe('Context Providers', () => {
    it('should add context provider', () => {
      const provider = {
        name: 'test-provider',
        getContext: () => ({ test: 'value' }),
      };
      client.addContextProvider(provider);
      expect(client).toBeInstanceOf(AnalyticsClient);
    });
  });

  describe('Filters', () => {
    it('should add filter', () => {
      const filter = {
        name: 'test-filter',
        shouldBlock: (_event: any) => false,
      };
      client.addFilter(filter);
      expect(client).toBeInstanceOf(AnalyticsClient);
    });
  });

  describe('Network Awareness', () => {
    it('should report online status', () => {
      const status = client.isOnline();
      expect(typeof status).toBe('boolean');
    });

    it('should get network status', () => {
      const status = client.getNetworkStatus();
      expect(status).toHaveProperty('online');
    });
  });

  describe('destroy', () => {
    it('should destroy client', () => {
      expect(() => client.destroy()).not.toThrow();
    });

    it('should prevent tracking after destroy', async () => {
      client.destroy();
      const result = Effect.runPromise(
        client.track({
          name: 'test',
        }),
      );
      await expect(result).rejects.toThrow('AnalyticsClient has been destroyed');
    });
  });
});
