export type E2EConfig = {
  baseURL: string;
  specs: string[];
  webServer?: {
    command: string;
    url: string;
    reuseExistingServer: boolean;
  };
  browser?: {
    headless: boolean;
  };
  artifactsDir: string;
};

const config: E2EConfig = {
  baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
  specs: ["tests/**/*.spec.ts"],
  webServer: {
    command: "bun --cwd ../apps/web run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  browser: {
    headless: !!process.env.CI,
  },
  artifactsDir: "test-results",
};

export default config;
