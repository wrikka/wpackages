import { HMR_DEFAULT_PATH, HMR_DEFAULT_PORT, HMR_TIMEOUT } from '../constants';
import type { HmrConfig, HmrMessage, Logger, Plugin } from '../types';

export class HmrService {
  private ws?: WebSocket;
  private clients: Set<WebSocket> = new Set();
  private watcher?: any;

  constructor(
    private config: HmrConfig,
    private logger: Logger,
    private plugins: Plugin[] = []
  ) {}

  async start(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('HMR is disabled');
      return;
    }

    const port = this.config.port || HMR_DEFAULT_PORT;
    const host = this.config.host || 'localhost';

    this.logger.info(`Starting HMR server on ws://${host}:${port}`);

    const server = Bun.serve({
      port,
      hostname: host,
      fetch: this.handleWebSocketUpgrade.bind(this),
      websocket: {
        open: this.handleWebSocketOpen.bind(this),
        message: this.handleWebSocketMessage.bind(this),
        close: this.handleWebSocketClose.bind(this),
        error: this.handleWebSocketError.bind(this),
      },
    });

    this.logger.info(`HMR server started on ws://${host}:${port}`);
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
    }

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.clients.clear();

    this.logger.info('HMR server stopped');
  }

  private handleWebSocketUpgrade(req: Request): Response | Promise<Response> {
    const url = new URL(req.url);
    
    if (url.pathname === (this.config.path || HMR_DEFAULT_PATH)) {
      return new Response('Upgrade Required', { status: 426 });
    }

    return new Response('Not Found', { status: 404 });
  }

  private handleWebSocketOpen(ws: WebSocket): void {
    this.clients.add(ws);
    this.logger.debug('HMR client connected');
    
    this.sendToClient(ws, {
      type: 'connected',
      timestamp: Date.now(),
    });
  }

  private handleWebSocketMessage(ws: WebSocket, message: string | Buffer): void {
    try {
      const data = JSON.parse(message.toString());
      this.logger.debug('Received HMR message:', data);
    } catch (error) {
      this.logger.error('Failed to parse HMR message:', error);
    }
  }

  private handleWebSocketClose(ws: WebSocket): void {
    this.clients.delete(ws);
    this.logger.debug('HMR client disconnected');
  }

  private handleWebSocketError(ws: WebSocket, error: Error): void {
    this.logger.error('HMR WebSocket error:', error);
    this.clients.delete(ws);
  }

  async sendToClient(client: WebSocket, message: HmrMessage): Promise<void> {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        this.logger.error('Failed to send HMR message:', error);
        this.clients.delete(client);
      }
    }
  }

  async broadcast(message: HmrMessage): Promise<void> {
    const promises = Array.from(this.clients).map(client => 
      this.sendToClient(client, message)
    );
    
    await Promise.allSettled(promises);
  }

  async handleFileChange(filePath: string, type: 'create' | 'update' | 'delete'): Promise<void> {
    this.logger.debug(`File ${type}: ${filePath}`);

    const context = {
      file: filePath,
      timestamp: Date.now(),
      type,
    };

    for (const plugin of this.plugins) {
      if (plugin.handleHotUpdate) {
        try {
          const result = await plugin.handleHotUpdate(context);
          if (result) {
            for (const ctx of result) {
              await this.sendUpdate(ctx);
            }
            return;
          }
        } catch (error) {
          this.logger.error(`Plugin ${plugin.name} handleHotUpdate failed:`, error);
        }
      }
    }

    await this.sendUpdate(context);
  }

  private async sendUpdate(context: { file: string; timestamp: number; type: string }): Promise<void> {
    await this.broadcast({
      type: 'update',
      file: context.file,
      timestamp: context.timestamp,
      data: { type: context.type },
    });
  }

  async triggerFullReload(): Promise<void> {
    await this.broadcast({
      type: 'full-reload',
      timestamp: Date.now(),
    });
  }

  async sendError(error: Error): Promise<void> {
    await this.broadcast({
      type: 'error',
      timestamp: Date.now(),
      data: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
}
