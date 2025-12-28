// Main exports
export { createApp } from "./app";
export { createDevServer } from "./services/dev-server.service";

// Web server (merged from w-webserver)
export { createWebServerPlugin } from "webserver/vite-plugin-wserver";
export type { WServerOptions } from "webserver/vite-plugin-wserver";

// Type exports
export type { DevServerConfig, DevServerInstance, ServerStats } from "./types";
export type { HotReloadService, PerformanceMonitor, PerformanceStats } from "./services";

// Component exports
export { createErrorMessage, formatErrorMessage } from "./components";
