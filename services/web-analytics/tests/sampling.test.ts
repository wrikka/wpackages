import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { shouldSampleEvent, markEventAsSampled, filterSampledEvents } from '../src/services/sampling.service.js';

describe('Sampling Service', () => {
  describe('shouldSampleEvent', () => {
    it('should sample all events when enabled with rate 1', async () => {
      const event = { name: 'test' };
      const config = {
        enabled: true,
        rate: 1.0,
        importantEvents: [],
      };
      const result = await Effect.runPromise(shouldSampleEvent(event, config));
      expect(result).toBe(true);
    });

    it('should sample no events when enabled with rate 0', async () => {
      const event = { name: 'test' };
      const config = {
        enabled: true,
        rate: 0,
        importantEvents: [],
      };
      const result = await Effect.runPromise(shouldSampleEvent(event, config));
      expect(result).toBe(false);
    });

    it('should always sample important events', async () => {
      const event = { name: 'important_event' };
      const config = {
        enabled: true,
        rate: 0,
        importantEvents: ['important_event'],
      };
      const result = await Effect.runPromise(shouldSampleEvent(event, config));
      expect(result).toBe(true);
    });

    it('should not sample when disabled', async () => {
      const event = { name: 'test' };
      const config = {
        enabled: false,
        rate: 0,
        importantEvents: [],
      };
      const result = await Effect.runPromise(shouldSampleEvent(event, config));
      expect(result).toBe(true);
    });
  });

  describe('markEventAsSampled', () => {
    it('should mark event as sampled', () => {
      const event = { name: 'test' };
      const result = markEventAsSampled(event, true);
      expect(result.sampled).toBe(true);
    });

    it('should mark event as not sampled', () => {
      const event = { name: 'test' };
      const result = markEventAsSampled(event, false);
      expect(result.sampled).toBe(false);
    });

    it('should preserve other properties', () => {
      const event = { name: 'test', properties: { key: 'value' } };
      const result = markEventAsSampled(event, true);
      expect(result.name).toBe('test');
      expect(result.properties).toEqual({ key: 'value' });
    });
  });

  describe('filterSampledEvents', () => {
    it('should filter out events marked as not sampled', () => {
      const events = [
        { name: 'test1', sampled: true },
        { name: 'test2', sampled: false },
        { name: 'test3', sampled: true },
      ];
      const result = filterSampledEvents(events);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('test1');
      expect(result[1].name).toBe('test3');
    });

    it('should keep events without sampled flag', () => {
      const events = [
        { name: 'test1' },
        { name: 'test2', sampled: false },
        { name: 'test3' },
      ];
      const result = filterSampledEvents(events);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('test1');
      expect(result[1].name).toBe('test3');
    });

    it('should return empty array when all events are not sampled', () => {
      const events = [
        { name: 'test1', sampled: false },
        { name: 'test2', sampled: false },
      ];
      const result = filterSampledEvents(events);
      expect(result).toHaveLength(0);
    });
  });
});
