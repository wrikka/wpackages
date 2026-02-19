export { generateRoutes } from "./lib/core/generator";

export { generateVirtualRoutesModuleCode } from "./lib/virtual-module.lib";
export type { VirtualRoutesModule } from "./lib/virtual-module.lib";

export * from "./types";
export * from "./utils";
export * from "./components";
export { createServerRouter } from "./server/server-router.service";
export * from "./error";

export * from "./lib/route-schema.lib";
export * from "./lib/route-cache.lib";
export * from "./lib/route-logger.lib";
export * from "./lib/route-metrics.lib";
export * from "./server/ssr";
export * from "./lib/code-splitter.lib";
export * from "./lib/route-preloader.lib";
export * from "./lib/route-metadata.lib";
export * from "./components/error-boundary";
export * from "./lib/route-groups.lib";
export * from "./lib/route-redirect.lib";
export * from "./tests";
export * from "./constants";
