import { AnalyticsConfig } from '../types/analytics.js';

export const DEFAULT_ENDPOINT = 'https://analytics.api.example.com/v1/events';

export const DEFAULT_CONFIG = Object.freeze({
  endpoint: DEFAULT_ENDPOINT,
  batchSize: 10,
  flushInterval: 30000,
  enableDebug: false,
} as const);

export const EVENT_NAMES = Object.freeze({
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
  SUBMIT: 'submit',
  ERROR: 'error',
  CUSTOM: 'custom',
} as const);

export const getAnalyticsConfig = (apiKey: string, partialConfig?: Partial<AnalyticsConfig>): AnalyticsConfig => {
  return Object.freeze({
    apiKey,
    ...DEFAULT_CONFIG,
    ...partialConfig,
  });
};
