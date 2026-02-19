export interface RateLimit {
  id: string;
  organizationId: string;
  userId?: string;
  type: 'messages_per_hour' | 'tokens_per_day' | 'api_calls_per_minute';
  limit: number;
  window: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RateLimitUsage {
  rateLimitId: string;
  count: number;
  windowStart: Date | string;
}
