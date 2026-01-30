import { FastifyInstance, FastifyRequest, FastifyReply, HookHandlerDone } from 'fastify';
import { AnalyticsClient } from '../app.js';
import { AnalyticsConfig } from '../types/analytics.js';

export interface FastifyAnalyticsConfig extends AnalyticsConfig {
  trackRequests?: boolean;
  trackErrors?: boolean;
  trackResponseTime?: boolean;
  excludePaths?: string[];
  includeHeaders?: string[];
  includeQueryParams?: boolean;
}

declare module 'fastify' {
  interface FastifyInstance {
    analytics: AnalyticsClient;
  }
}

export class FastifyAnalytics {
  private client: AnalyticsClient;
  private config: FastifyAnalyticsConfig;

  constructor(config: FastifyAnalyticsConfig) {
    this.config = config;
    this.client = new AnalyticsClient(config);
  }

  register(fastify: FastifyInstance, options: FastifyAnalyticsConfig, done: HookHandlerDone): void {
    fastify.decorate('analytics', this.client);

    if (this.config.trackRequests) {
      fastify.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
        const path = request.url;

        if (this.config.excludePaths?.some((exclude) => path.startsWith(exclude))) {
          return;
        }

        const properties: Record<string, unknown> = {
          method: request.method,
          path,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        };

        if (this.config.includeQueryParams && Object.keys(request.query).length > 0) {
          properties.queryParams = request.query;
        }

        if (this.config.includeHeaders) {
          const headers: Record<string, string> = {};
          this.config.includeHeaders.forEach((header) => {
            const value = request.headers[header];
            if (value) {
              headers[header] = Array.isArray(value) ? value.join(', ') : value;
            }
          });
          properties.headers = headers;
        }

        await Effect.runPromise(
          this.client.track({
            name: 'http_request',
            properties,
          }),
        ).catch((error) => {
          if (this.config.enableDebug) {
            console.error('Failed to track request:', error);
          }
        });
      });
    }

    if (this.config.trackErrors) {
      fastify.addHook('onError', async (request: FastifyRequest, _reply: FastifyReply, error: Error) => {
        await Effect.runPromise(
          this.client.track({
            name: 'error',
            properties: {
              type: 'fastify_error',
              message: error.message,
              stack: error.stack,
              path: request.url,
              method: request.method,
            },
            priority: 'high',
          }),
        ).catch((err) => {
          if (this.config.enableDebug) {
            console.error('Failed to track error:', err);
          }
        });
      });
    }

    if (this.config.trackResponseTime) {
      fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
        const responseTime = reply.getResponseTime();
        await Effect.runPromise(
          this.client.track({
            name: 'http_response',
            properties: {
              method: request.method,
              path: request.url,
              statusCode: reply.statusCode,
              responseTime,
            },
          }),
        ).catch((error) => {
          if (this.config.enableDebug) {
            console.error('Failed to track response time:', error);
          }
        });
      });
    }

    done();
  }

  getClient(): AnalyticsClient {
    return this.client;
  }
}

export const fastifyAnalyticsPlugin = async (
  fastify: FastifyInstance,
  options: FastifyAnalyticsConfig,
) => {
  const analytics = new FastifyAnalytics(options);
  await new Promise<void>((resolve) => {
    analytics.register(fastify, options, resolve);
  });
};

export const createFastifyAnalytics = (config: FastifyAnalyticsConfig): FastifyAnalytics => {
  return new FastifyAnalytics(config);
};
