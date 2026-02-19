import type { E2EConfig } from "../e2e.config";
import config from "../e2e.config";

export function loadConfig(): E2EConfig {
  const headlessEnv = process.env.E2E_HEADLESS;
  const headlessOverride =
    headlessEnv === undefined
      ? undefined
      : headlessEnv === "1" || headlessEnv.toLowerCase() === "true";

  return {
    ...config,
    browser: {
      headless: headlessOverride ?? (config.browser?.headless ?? true),
    },
  };
}
