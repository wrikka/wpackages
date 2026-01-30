import { Request, Response, NextFunction } from 'express';
import { AnalyticsClient } from '../app.js';
import { AnalyticsConfig } from '../types/analytics.js';
import { Event } from '../types/analytics.js';

export interface ExpressAnalyticsConfig extends AnalyticsConfig {
  trackRequests?: boolean;
  trackErrors?: boolean;
  trackResponseTime?: boolean;
  excludePaths?: string[];
  includeHeaders?: string[];
  includeQueryParams?: boolean;
}

export class ExpressAnalytics {
  private client: AnalyticsClient;
  private config: ExpressAnalyticsConfig;

  constructor(config: ExpressAnalyticsConfig) {
    this.config = config;
    this.client = new AnalyticsClient(config);
  }

  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      if (this.config.trackRequests) {
        const path = req.path;
        
        if (this.config.excludePaths?.some((exclude) => path.startsWith(exclude))) {
          next();
          return;
        }

        const properties: Record<string, unknown> = {
          method: req.method,
          path,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        };

        if (this.config.includeQueryParams && Object.keys(req.query).length > 0) {
          properties.queryParams = req.query;
        }

        if (this.config.includeHeaders) {
          const headers: Record<string, string> = {};
          this.config.includeHeaders.forEach((header) => {
            const value = req.get(header);
            if (value) {
              headers[header] = value;
            }
          });
          properties.headers = headers;
        }

        Effect.runPromise(
          this.client.track({
            name: 'http_request',
            properties,
          }),
        ).catch((error) => {
          if (this.config.enableDebug) {
            console.error('Failed to track request:', error);
          }
        });
      }

      if (this.config.trackErrors) {
        res.on('finish', () => {
          if (res.statusCode >= 400) {
            Effect.runPromise(
              this.client.track({
                name: 'http_error',
                properties: {
                  method: req.method,
                  path: req.path,
                  statusCode: res.statusCode,
                  statusMessage: res.statusMessage,
                },
                priority: 'high',
              }),
            ).catch((error) => {
              if (this.config.enableDebug) {
                console.error('Failed to track error:', error);
              }
            });
          }
        });
      }

      if (this.config.trackResponseTime) {
        res.on('finish', () => {
          const responseTime = Date.now() - startTime;
          Effect.runPromise(
            this.client.track({
              name: 'http_response',
              properties: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
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

      next();
    };
  }

  errorHandler(): (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      Effect.runPromise(
        this.client.track({
          name: 'error',
          properties: {
            type: 'express_error',
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
          },
          priority: 'high',
        }),
      ).catch((error) => {
        if (this.config.enableDebug) {
          console.error('Failed to track error:', error);
        }
      });

      next(err);
    };
  }

  getClient(): AnalyticsClient {
    return this.client;
  }
}

export const createExpressAnalytics = (config: ExpressAnalyticsConfig): ExpressAnalytics => {
  return new ExpressAnalytics(config);
};
