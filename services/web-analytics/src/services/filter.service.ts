import { Effect } from 'effect';
import { Event, EventFilter } from '../types/analytics.js';

export class FilterManager {
  private filters: EventFilter[] = [];

  add(filter: EventFilter): void {
    this.filters.push(filter);
  }

  remove(name: string): void {
    this.filters = this.filters.filter((f) => f.name !== name);
  }

  shouldBlock(event: Event): Effect.Effect<boolean, never> {
    return Effect.succeed(
      this.filters.some((filter) => filter.shouldBlock(event)),
    );
  }

  clear(): void {
    this.filters = [];
  }
}

export const createEventFilter = (
  name: string,
  shouldBlock: (event: Event) => boolean,
): EventFilter => ({
  name,
  shouldBlock,
});

export const blocklistFilter = (blockedEvents: string[]): EventFilter =>
  createEventFilter('blocklist', (event) => blockedEvents.includes(event.name));

export const allowlistFilter = (allowedEvents: string[]): EventFilter =>
  createEventFilter('allowlist', (event) => !allowedEvents.includes(event.name));

export const propertyFilter = (
  name: string,
  condition: (properties?: Record<string, unknown>) => boolean,
): EventFilter =>
  createEventFilter(name, (event) => condition(event.properties));

export const regexFilter = (
  name: string,
  pattern: RegExp,
): EventFilter =>
  createEventFilter(name, (event) => pattern.test(event.name));
