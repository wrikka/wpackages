import { Effect } from 'effect';
import { Event, EventMiddleware } from '../types/analytics.js';

export class MiddlewareManager {
  private middlewares: EventMiddleware[] = [];

  add(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  remove(name: string): void {
    this.middlewares = this.middlewares.filter((m) => m.name !== name);
  }

  process(event: Event): Effect.Effect<Event | null, never> {
    return Effect.succeed(
      this.middlewares.reduce((currentEvent: Event | null, middleware) => {
        if (currentEvent === null) return null;
        return middleware.process(currentEvent);
      }, event),
    );
  }

  clear(): void {
    this.middlewares = [];
  }
}

export const createMiddleware = (
  name: string,
  process: (event: Event) => Event | null,
): EventMiddleware => ({
  name,
  process,
});

export const propertyEnrichmentMiddleware = (
  name: string,
  properties: Record<string, unknown>,
): EventMiddleware =>
  createMiddleware(name, (event) => ({
    ...event,
    properties: { ...event.properties, ...properties },
  }));

export const propertyRemovalMiddleware = (
  name: string,
  keysToRemove: string[],
): EventMiddleware =>
  createMiddleware(name, (event) => {
    if (!event.properties) return event;
    const newProperties = { ...event.properties };
    keysToRemove.forEach((key) => delete newProperties[key]);
    return { ...event, properties: newProperties };
  });

export const piiFilteringMiddleware = (
  name: string,
  piiKeys: string[] = ['email', 'password', 'ssn', 'creditCard', 'phone'],
): EventMiddleware =>
  createMiddleware(name, (event) => {
    if (!event.properties) return event;
    const newProperties = { ...event.properties };
    piiKeys.forEach((key) => {
      if (key in newProperties) {
        newProperties[key] = '[REDACTED]';
      }
    });
    return { ...event, properties: newProperties };
  });
