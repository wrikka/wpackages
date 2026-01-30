import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { validateEvent, createEventBatch } from '../src/services/analytics.service.js';
import { AnalyticsValidationError } from '../src/error.js';

describe('Analytics Service', () => {
  describe('validateEvent', () => {
    it('should validate valid event', async () => {
      const event = {
        name: 'page_view',
        properties: { path: '/home' },
      };
      const result = await Effect.runPromise(validateEvent(event));
      expect(result).toHaveProperty('name', 'page_view');
      expect(result).toHaveProperty('eventId');
      expect(result).toHaveProperty('timestamp');
    });

    it('should fail without event name', async () => {
      const event = { properties: {} } as any;
      const result = Effect.runPromise(validateEvent(event));
      await expect(result).rejects.toThrow(AnalyticsValidationError);
    });

    it('should fail with invalid event name', async () => {
      const event = { name: 'invalid@name!' };
      const result = Effect.runPromise(validateEvent(event));
      await expect(result).rejects.toThrow(AnalyticsValidationError);
    });

    it('should sanitize event name', async () => {
      const event = { name: 'Test Event Name' };
      const result = await Effect.runPromise(validateEvent(event));
      expect(result.name).toBe('test_event_name');
    });

    it('should add event id if missing', async () => {
      const event = { name: 'test' };
      const result = await Effect.runPromise(validateEvent(event));
      expect(result.eventId).toBeDefined();
    });

    it('should keep existing event id', async () => {
      const event = { name: 'test', eventId: 'existing-id' };
      const result = await Effect.runPromise(validateEvent(event));
      expect(result.eventId).toBe('existing-id');
    });

    it('should add timestamp if missing', async () => {
      const event = { name: 'test' };
      const result = await Effect.runPromise(validateEvent(event));
      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should keep existing timestamp', async () => {
      const timestamp = 1234567890;
      const event = { name: 'test', timestamp };
      const result = await Effect.runPromise(validateEvent(event));
      expect(result.timestamp).toBe(timestamp);
    });
  });

  describe('createEventBatch', () => {
    it('should create event batch', () => {
      const events = [
        { name: 'test1', eventId: '1', timestamp: 1 },
        { name: 'test2', eventId: '2', timestamp: 2 },
      ];
      const batch = createEventBatch(events, 10);
      expect(batch).toHaveProperty('events');
      expect(batch).toHaveProperty('batchId');
      expect(batch).toHaveProperty('sentAt');
      expect(batch.events).toHaveLength(2);
    });

    it('should generate unique batch id', () => {
      const batch1 = createEventBatch([], 10);
      const batch2 = createEventBatch([], 10);
      expect(batch1.batchId).not.toBe(batch2.batchId);
    });

    it('should set sent at timestamp', () => {
      const before = Date.now();
      const batch = createEventBatch([], 10);
      const after = Date.now();
      expect(batch.sentAt).toBeGreaterThanOrEqual(before);
      expect(batch.sentAt).toBeLessThanOrEqual(after);
    });
  });
});
