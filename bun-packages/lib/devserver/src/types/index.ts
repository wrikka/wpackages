export interface DevServerConfig {
  port?: number;
  host?: string;
  root?: string;
  base?: string;
  hmr?: HmrConfig;
  cors?: CorsConfig;
  fs?: FileSystemConfig;
  server?: ServerConfig;
  build?: BuildConfig;
}

export interface HmrConfig {
  enabled?: boolean;
  port?: number;
  host?: string;
  path?: string;
  timeout?: number;
  overlay?: boolean;
}

export interface CorsConfig {
  enabled?: boolean;
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

export interface FileSystemConfig {
  strict?: boolean;
  allow?: string[];
  deny?: string[];
  serveIndex?: boolean;
}

export interface ServerConfig {
  headers?: Record<string, string>;
  middleware?: Middleware[];
}

export interface BuildConfig {
  target?: string;
  outDir?: string;
  assetsDir?: string;
  sourcemap?: boolean;
  minify?: boolean;
}

export interface Middleware {
  name: string;
  handler: (req: Request, next: () => Promise<Response>) => Promise<Response>;
}

export interface HmrContext {
  file: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
}

export interface HmrMessage {
  type: 'connected' | 'update' | 'full-reload' | 'error' | 'custom';
  data?: any;
  file?: string;
  timestamp?: number;
}

export interface Plugin {
  name: string;
  configureServer?: (server: IDevServer) => void | Promise<void>;
  resolveId?: (id: string, importer?: string) => Promise<string | null>;
  load?: (id: string) => Promise<string | null>;
  transform?: (code: string, id: string) => Promise<{ code: string; map?: string } | null>;
  handleHotUpdate?: (ctx: HmrContext) => Promise<HmrContext[] | void>;
}

export interface IDevServer {
  readonly config: DevServerConfig;
  readonly plugins: Plugin[];
  start(): Promise<void>;
  stop(): Promise<void>;
  reload(): Promise<void>;
  sendHmr(message: HmrMessage): Promise<void>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
