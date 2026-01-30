import { AnalyticsClient } from './app.js';
import { getAnalyticsConfig } from './constant/analytics.const.js';

const client = new AnalyticsClient(
  getAnalyticsConfig('test-api-key', {
    enableDebug: true,
  }),
);

Effect.runPromise(
  client.track({
    name: 'page_view',
    properties: {
      path: '/home',
      referrer: 'https://example.com',
    },
  }),
)
  .then(() => console.log('Event tracked successfully'))
  .catch((error) => console.error('Failed to track event:', error));
