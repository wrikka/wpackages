import { Effect } from 'effect';
import { Event, ContextProvider } from '../types/analytics.js';

export class ContextManager {
  private providers: ContextProvider[] = [];

  add(provider: ContextProvider): void {
    this.providers.push(provider);
  }

  remove(name: string): void {
    this.providers = this.providers.filter((p) => p.name !== name);
  }

  enrich(event: Event): Effect.Effect<Event, never> {
    const context = this.providers.reduce(
      (acc, provider) => ({ ...acc, ...provider.getContext() }),
      {},
    );
    return Effect.succeed({
      ...event,
      properties: { ...event.properties, ...context },
    });
  }

  clear(): void {
    this.providers = [];
  }
}

export const createContextProvider = (
  name: string,
  getContext: () => Record<string, unknown>,
): ContextProvider => ({
  name,
  getContext,
});

export const deviceInfoProvider = (): ContextProvider =>
  createContextProvider('device', () => {
    if (typeof window === 'undefined') return {};
    const navigator = window.navigator as any;
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };
  });

export const pageInfoProvider = (): ContextProvider =>
  createContextProvider('page', () => {
    if (typeof window === 'undefined') return {};
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
    };
  });

export const performanceInfoProvider = (): ContextProvider =>
  createContextProvider('performance', () => {
    if (typeof window === 'undefined' || !window.performance) return {};
    const timing = window.performance.timing as any;
    return {
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
    };
  });
