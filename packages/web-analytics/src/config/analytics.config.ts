import { AnalyticsConfig } from '../types/analytics.js';
import { DEFAULT_CONFIG } from '../constant/analytics.const.js';

export const AnalyticsConfig = Object.freeze({
  requestTimeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  maxQueueSize: 100,
  ...DEFAULT_CONFIG,
} as const) satisfies AnalyticsConfig;
