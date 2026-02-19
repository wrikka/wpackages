import fg from "fast-glob";
import pc from "picocolors";
import { mkdir } from "node:fs/promises";
import type { E2EConfig } from "../e2e.config";
import { createBrowserSession } from "./browser";
import { loadConfig } from "./config";
import { getRegisteredTests } from "./dsl";
import { ensureWebServer } from "./webServer";

type TestResult = {
  name: string;
  ok: boolean;
  durationMs: number;
  error?: unknown;
};

async function importSpecs(config: E2EConfig): Promise<void> {
  const specFiles = await fg(config.specs, { cwd: process.cwd(), absolute: true });
  for (const file of specFiles) {
    await import(file);
  }
}

export async function runTests(): Promise<number> {
  const config = loadConfig();

  const artifactsDir = `${process.cwd()}/${config.artifactsDir}`;
  await mkdir(artifactsDir, { recursive: true });

  const server = config.webServer
    ? await ensureWebServer(config.webServer)
    : { stop: async () => {} };

  try {
    await importSpecs(config);

    const tests = [...getRegisteredTests()];
    if (tests.length === 0) {
      console.log(pc.yellow("No tests found."));
      return 0;
    }

    const results: TestResult[] = [];

    for (const t of tests) {
      const started = performance.now();
      const session = await createBrowserSession({ headless: config.browser?.headless ?? true });

      try {
        const base = config.baseURL.replace(/\/$/, "");
        const pageApi = {
          goto: async (path: string) => {
            const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
            await session.page.goto(url, { waitUntil: "domcontentloaded" });
          },
          title: async () => session.page.title(),
          text: async () => {
            return session.page.evaluate(() => document.body?.innerText ?? "");
          },
        };

        await t.fn({ page: pageApi });

        results.push({
          name: t.name,
          ok: true,
          durationMs: Math.round(performance.now() - started),
        });
        console.log(`${pc.green("PASS")} ${t.name}`);
      } catch (err) {
        const durationMs = Math.round(performance.now() - started);
        results.push({ name: t.name, ok: false, durationMs, error: err });

        const safeName = t.name.replace(/[^a-z0-9-_]+/gi, "_");
        const screenshotPath = `${artifactsDir}/${safeName}.png`;
        try {
          await session.page.screenshot({ path: screenshotPath, fullPage: true });
        } catch {
          // ignore
        }

        console.log(`${pc.red("FAIL")} ${t.name} (${durationMs}ms)`);
        console.log(pc.dim(String(err instanceof Error ? err.stack ?? err.message : err)));
      } finally {
        await session.close();
      }
    }

    const failed = results.filter((r) => !r.ok).length;
    console.log();
    console.log(
      failed === 0
        ? pc.green(`All tests passed (${results.length}).`)
        : pc.red(`${failed}/${results.length} tests failed.`),
    );

    return failed === 0 ? 0 : 1;
  } finally {
    await server.stop();
  }
}
