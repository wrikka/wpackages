export interface H3Event {
  request: Request;
  response: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  };
  context: Record<string, any>;
}

export interface H3App {
  use: (handler: H3EventHandler) => void;
  handle: (event: H3Event) => Promise<any>;
}

export interface H3Router {
  get: (path: string, handler: H3EventHandler) => void;
  post: (path: string, handler: H3EventHandler) => void;
  put: (path: string, handler: H3EventHandler) => void;
  delete: (path: string, handler: H3EventHandler) => void;
  patch: (path: string, handler: H3EventHandler) => void;
  options: (path: string, handler: H3EventHandler) => void;
  use: (handler: H3EventHandler) => void;
}

export type H3EventHandler = (event: H3Event) => unknown;

export interface H3Response {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface RouteMatch {
  handler: H3EventHandler;
  params: Record<string, string>;
}

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}
