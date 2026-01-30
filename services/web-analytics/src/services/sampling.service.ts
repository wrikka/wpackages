import { Effect } from 'effect';
import { Event } from '../types/analytics.js';

export interface SamplingConfig {
  enabled: boolean;
  rate: number;
  importantEvents: string[];
}

export const shouldSampleEvent = (
  event: Event,
  config: SamplingConfig,
): Effect.Effect<boolean, never> => {
  if (!config.enabled) {
    return Effect.succeed(true);
  }

  if (config.importantEvents.includes(event.name)) {
    return Effect.succeed(true);
  }

  const sampled = Math.random() < config.rate;
  return Effect.succeed(sampled);
};

export const markEventAsSampled = (event: Event, sampled: boolean): Event => ({
  ...event,
  sampled,
});

export const filterSampledEvents = (events: Event[]): Event[] =>
  events.filter((event) => event.sampled !== false);
