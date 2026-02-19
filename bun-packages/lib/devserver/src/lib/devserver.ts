import {
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_ROOT,
  DEFAULT_BASE,
  DEFAULT_SERVER_HEADERS,
  HMR_CLIENT_CODE,
} from '../constants';
import { FileUtils } from '../utils';
import { ConsoleLogger } from '../utils';
import { HmrService } from '../services';
import type {
  DevServerConfig,
  Plugin,
  Logger,
  Middleware,
  HmrMessage,
  IDevServer,
} from '../types';

export class DevServer implements IDevServer {
  private server?: Bun.Server<unknown>;
  private hmrService?: HmrService;
  private fileUtils: FileUtils;
  private middleware: Middleware[] = [];
  private isStarted = false;

  constructor(
    public readonly config: DevServerConfig,
    public readonly plugins: Plugin[] = [],
    private logger: Logger = new ConsoleLogger()
  ) {
    this.config = {
      port: DEFAULT_PORT,
      host: DEFAULT_HOST,
      root: DEFAULT_ROOT,
      base: DEFAULT_BASE,
      hmr: { enabled: true },
      cors: { enabled: true },
      fs: { strict: false },
      server: {},
      ...config,
    };

    this.fileUtils = new FileUtils(this.logger);
    this.setupMiddleware();
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      this.logger.warn('DevServer is already started');
      return;
    }

    try {
      await this.setupHmr();
      await this.setupPlugins();
      await this.startHttpServer();

      this.isStarted = true;
      this.logger.info(
        `DevServer started at http://${this.config.host}:${this.config.port}`
      );
    } catch (error) {
      this.logger.error('Failed to start DevServer:', error);
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      return;
    }

    try {
      if (this.hmrService) {
        await this.hmrService.stop();
      }

      if (this.server) {
        void this.server.stop();
      }

      this.isStarted = false;
      this.logger.info('DevServer stopped');
    } catch (error) {
      this.logger.error('Error stopping DevServer:', error);
    }
  }

  async reload(): Promise<void> {
    if (this.hmrService) {
      await this.hmrService.triggerFullReload();
    }
  }

  async sendHmr(message: HmrMessage): Promise<void> {
    if (this.hmrService) {
      await this.hmrService.broadcast(message);
    }
  }

  private setupMiddleware(): void {
    if (this.config.cors?.enabled) {
      this.addCorsMiddleware();
    }

    if (this.config.server?.middleware) {
      this.middleware.push(...this.config.server.middleware);
    }

    this.middleware.push(this.createStaticFileMiddleware());
    this.middleware.push(this.createHmrClientMiddleware());
  }

  private addCorsMiddleware(): void {
    this.middleware.push({
      name: 'cors',
      handler: async (_req, next) => {
        const response = await next();

        // Only add CORS headers if not already present
        if (!response.headers.has('Access-Control-Allow-Origin') && this.config.cors?.origin) {
          const origin = Array.isArray(this.config.cors.origin)
            ? this.config.cors.origin.join(', ')
            : this.config.cors.origin;
          response.headers.set('Access-Control-Allow-Origin', origin);
        }

        if (!response.headers.has('Access-Control-Allow-Methods') && this.config.cors?.methods) {
          response.headers.set(
            'Access-Control-Allow-Methods',
            this.config.cors.methods.join(', ')
          );
        }

        if (!response.headers.has('Access-Control-Allow-Headers') && this.config.cors?.allowedHeaders) {
          response.headers.set(
            'Access-Control-Allow-Headers',
            this.config.cors.allowedHeaders.join(', ')
          );
        }

        if (!response.headers.has('Access-Control-Allow-Credentials') && this.config.cors?.credentials) {
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return response;
      },
    });
  }

  private createStaticFileMiddleware(): Middleware {
    return {
      name: 'static-files',
      handler: async (req, next) => {
        const url = new URL(req.url);
        const pathname = url.pathname;

        if (pathname.startsWith('/@')) {
          return next();
        }

        const filePath = await this.resolveFilePath(pathname);

        if (await this.fileUtils.fileExists(filePath)) {
          const mimeType = this.fileUtils.getMimeType(filePath);
          const content = await this.fileUtils.readFile(filePath);

          return new Response(content, {
            headers: {
              'Content-Type': mimeType,
              ...DEFAULT_SERVER_HEADERS,
            },
          });
        }

        return next();
      },
    };
  }

  private createHmrClientMiddleware(): Middleware {
    return {
      name: 'hmr-client',
      handler: async (req, next) => {
        const url = new URL(req.url);
        const pathname = url.pathname;

        if (pathname === '/@vite/client' || pathname === '/@hmr-client') {
          return new Response(HMR_CLIENT_CODE, {
            headers: {
              'Content-Type': 'application/javascript',
              ...DEFAULT_SERVER_HEADERS,
            },
          });
        }

        return next();
      },
    };
  }

  private async resolveFilePath(pathname: string): Promise<string> {
    const root = this.config.root || DEFAULT_ROOT;
    const base = this.config.base || DEFAULT_BASE;

    const relativePath = pathname.replace(base, '');
    const filePath = this.fileUtils.resolvePath(root, relativePath);

    if (await this.fileUtils.isDirectory(filePath)) {
      return this.fileUtils.resolvePath(filePath, 'index.html');
    }

    return filePath;
  }

  private async setupHmr(): Promise<void> {
    if (this.config.hmr?.enabled) {
      this.hmrService = new HmrService(
        this.config.hmr,
        this.logger,
        this.plugins
      );
      await this.hmrService.start();
    }
  }

  private async setupPlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.configureServer) {
        try {
          await plugin.configureServer(this);
        } catch (error) {
          this.logger.error(`Plugin ${plugin.name} configureServer failed:`, error);
        }
      }
    }
  }

  private async startHttpServer(): Promise<void> {
    const port = this.config.port || DEFAULT_PORT;
    const host = this.config.host || DEFAULT_HOST;

    this.server = Bun.serve({
      port,
      hostname: host,
      fetch: this.handleRequest.bind(this),
    });
  }

  private async handleRequest(req: Request): Promise<Response> {
    let index = 0;

    const next = async (): Promise<Response> => {
      if (index >= this.middleware.length) {
        return new Response('Not Found', { status: 404 });
      }

      const middleware = this.middleware[index++];
      if (!middleware) {
        return new Response('Internal Server Error', { status: 500 });
      }

      try {
        return await middleware.handler(req, next);
      } catch (middlewareError) {
        this.logger.error(`Middleware '${middleware.name}' error:`, middlewareError);
        throw middlewareError;
      }
    };

    try {
      return await next();
    } catch (error) {
      this.logger.error('Request handling error:', error);

      if (this.hmrService) {
        await this.hmrService.sendError(error as Error);
      }

      return new Response('Internal Server Error', { status: 500 });
    }
  }
}
