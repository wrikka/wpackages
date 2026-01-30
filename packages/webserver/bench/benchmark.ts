import autocannon from "autocannon";

export interface BenchmarkConfig {
  framework: string;
  url: string;
  connections: number;
  pipelining: number;
  duration: number;
}

export interface BenchmarkResult {
  framework: string;
  scenario: string;
  latency: {
    p50: number;
    p95: number | null;
    p99: number;
  };
  throughput: number;
  memory: number;
}

function getMethodForUrl(url: string): "GET" | "POST" {
  const pathname = new URL(url).pathname;
  if (pathname === "/api/data") return "POST";
  return "GET";
}

function getScenario(url: string, method: string): string {
  const pathname = new URL(url).pathname;
  return `${method} ${pathname}`;
}

export async function runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
  const method = getMethodForUrl(config.url);
  const scenario = getScenario(config.url, method);

  return new Promise((resolve, reject) => {
    autocannon(
      {
        url: config.url,
        connections: config.connections,
        pipelining: config.pipelining,
        duration: config.duration,
        amount: undefined,
        method,
        body: method === "POST" ? JSON.stringify({ test: "data" }) : undefined,
        headers: {
          "content-type": "application/json",
        },
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          framework: config.framework,
          scenario,
          latency: {
            p50: result.latency.mean,
            p95: result.latency.p95,
            p99: result.latency.p99,
          },
          throughput: result.requests.mean,
          memory: 0, // Memory tracking can be added later
        });
      }
    );
  });
}
