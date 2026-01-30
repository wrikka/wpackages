export class AnalyticsError extends Error {
  readonly _tag = 'AnalyticsError';
  constructor(message: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class AnalyticsNetworkError extends AnalyticsError {
  readonly _tag = 'AnalyticsNetworkError';
}

export class AnalyticsValidationError extends AnalyticsError {
  readonly _tag = 'AnalyticsValidationError';
}

export class AnalyticsRateLimitError extends AnalyticsError {
  readonly _tag = 'AnalyticsRateLimitError';
}

export class AnalyticsConfigError extends AnalyticsError {
  readonly _tag = 'AnalyticsConfigError';
}
