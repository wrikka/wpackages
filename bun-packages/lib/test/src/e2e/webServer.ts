export type WebServerHandle = {
  stop: () => Promise<void>;
};

async function waitForUrl(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 2_000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok) return;
    } catch {
      // ignore and retry
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function splitCommand(command: string): string[] {
  return command.split(/\s+/).filter(Boolean);
}

export async function ensureWebServer(params: {
  command: string;
  url: string;
  reuseExistingServer: boolean;
}): Promise<WebServerHandle> {
  if (params.reuseExistingServer) {
    try {
      await waitForUrl(params.url, 1_000);
      return { stop: async () => {} };
    } catch {
      // fallthrough: start server
    }
  }

  const cmd = splitCommand(params.command);
  const proc = Bun.spawn({
    cmd,
    stdout: "pipe",
    stderr: "pipe",
  });

  await waitForUrl(params.url, 30_000);

  return {
    async stop() {
      proc.kill();
      await proc.exited;
    },
  };
}
