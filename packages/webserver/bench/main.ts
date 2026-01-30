import { runBenchmark } from "./benchmark";
import { sampleConfigs, baselineResults, competitorData } from "./sample";
import { generateHTMLReport } from "./html-report";
import { BenchmarkRun } from "./types";
import { formatThroughput, formatLatency, getImprovementEmoji, formatSignedPercent, padLeft, padRight } from "./formatters";
import { writeFileSync } from "fs";
import { spawn } from "child_process";

// Libraries and algorithms used
const USED_LIBRARIES = [
  "Bun.serve (native)",
  "Bun Runtime",
  "TypeScript",
];

const USED_ALGORITHMS = [
  "Pre-allocated Response",
  "Direct Route Matching",
  "Map-based Routing",
  "Zero-copy JSON",
];

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms: ${url}`);
}

type ServerVariant = {
  name: string;
  script: string;
};

async function runBenchForServer(server: ServerVariant): Promise<{
  server: ServerVariant;
  results: any[];
  avgThroughput: number;
  avgLatencyP50: number;
}> {
  console.log(`\n📡 Starting benchmark server: ${server.name}`);
  const serverProc = spawn(
    process.platform === "win32" ? "bun.exe" : "bun",
    ["run", server.script],
    {
      stdio: "inherit",
    }
  );

  await waitForServer("http://localhost:3000/health", 10000);
  console.log("✅ Server is ready\n");

  const results: any[] = [];

  try {
    for (const config of sampleConfigs) {
      console.log(`📊 Running: ${config.url}`);
      try {
        const result = await runBenchmark({
          ...config,
          framework: server.name,
        });
        results.push(result);

        const baseline = baselineResults[result.scenario as keyof typeof baselineResults];

        if (baseline) {
          const improvement = {
            latency: {
              p50: ((baseline.latency.p50 - result.latency.p50) / baseline.latency.p50 * 100).toFixed(1),
              p95: result.latency.p95 === null
                ? "n/a"
                : ((baseline.latency.p95 - result.latency.p95) / baseline.latency.p95 * 100).toFixed(1),
              p99: ((baseline.latency.p99 - result.latency.p99) / baseline.latency.p99 * 100).toFixed(1),
            },
            throughput: ((result.throughput - baseline.throughput) / baseline.throughput * 100).toFixed(1),
          };

          console.log(`\n   📈 Results:`);
          console.log(`   ──────────────────────────────────────────────`);
          console.log(`   Latency P50:   ${formatLatency(result.latency.p50)} ${getImprovementEmoji(parseFloat(improvement.latency.p50))} ${improvement.latency.p50}%`);
          console.log(`   Throughput:    ${formatThroughput(result.throughput)} ${getImprovementEmoji(parseFloat(improvement.throughput))} ${improvement.throughput}%`);
        }
      } catch (error) {
        console.error(`❌ Failed to run benchmark for ${config.url}:`, error);
      }
      console.log();
    }
  } finally {
    console.log("🛑 Stopping server...");
    serverProc.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const avgThroughput = results.reduce((sum, r) => sum + r.throughput, 0) / results.length;
  const avgLatencyP50 = results.reduce((sum, r) => sum + r.latency.p50, 0) / results.length;

  return {
    server,
    results,
    avgThroughput,
    avgLatencyP50,
  };
}

export async function runBenchmarkSuite(): Promise<void> {
  console.log("🚀 Starting webserver benchmark...\n");

  // Display libraries and algorithms used
  console.log("📦 Libraries & Algorithms Used:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Libraries:");
  USED_LIBRARIES.forEach((lib) => console.log(`  • ${lib}`));
  console.log("\nAlgorithms:");
  USED_ALGORITHMS.forEach((algo) => console.log(`  • ${algo}`));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const servers: ServerVariant[] = [
    { name: "Fast (raw Bun.serve)", script: "bench/server-fast.ts" },
    { name: "App (createWebServer)", script: "bench/server.ts" },
  ];

  const serverRuns = [];
  for (const s of servers) {
    serverRuns.push(await runBenchForServer(s));
  }

  serverRuns.sort((a, b) => b.avgThroughput - a.avgThroughput);
  const bestRun = serverRuns[0]!;

  console.log("\n# Variant Ranking (CLI)");
  console.log(`${padRight("#", 2)}  ${padRight("Server", 22)}  ${padLeft("Avg Throughput", 14)}  ${padLeft("Avg P50", 10)}  ${padLeft("vs #1", 8)}`);
  console.log(`${"-".repeat(2)}  ${"-".repeat(22)}  ${"-".repeat(14)}  ${"-".repeat(10)}  ${"-".repeat(8)}`);
  serverRuns.forEach((r, idx) => {
    const vsBest = bestRun.avgThroughput === 0 ? NaN : ((r.avgThroughput - bestRun.avgThroughput) / bestRun.avgThroughput) * 100;
    const vsBestText = Number.isFinite(vsBest) ? formatSignedPercent(vsBest) : "n/a";
    console.log(
      `${padLeft(String(idx + 1), 2)}  ${padRight(r.server.name, 22)}  ${padLeft(formatThroughput(r.avgThroughput), 14)}  ${padLeft(formatLatency(r.avgLatencyP50), 10)}  ${padLeft(vsBestText, 8)}`,
    );
  });

  console.log(`\nWinner: ${bestRun.server.name}`);

  const results = bestRun.results;
  const avgThroughput = bestRun.avgThroughput;
  const avgLatency = bestRun.avgLatencyP50;

  // CLI summary (simple)
  console.log("\n# Benchmark Summary (CLI)");

  console.log("\n## Scenarios");
  console.log(`${padRight("Scenario", 22)}  ${padLeft("Throughput", 14)}  ${padLeft("P50", 10)}  ${padLeft("ΔThr", 8)}  ${padLeft("ΔP50", 8)}`);
  console.log(`${"-".repeat(22)}  ${"-".repeat(14)}  ${"-".repeat(10)}  ${"-".repeat(8)}  ${"-".repeat(8)}`);

  for (const r of results) {
    const baseline = baselineResults[r.scenario as keyof typeof baselineResults];
    const thrDelta = baseline ? ((r.throughput - baseline.throughput) / baseline.throughput) * 100 : NaN;
    const p50Delta = baseline ? ((baseline.latency.p50 - r.latency.p50) / baseline.latency.p50) * 100 : NaN;

    const thrDeltaText = Number.isFinite(thrDelta) ? formatSignedPercent(thrDelta) : "n/a";
    const p50DeltaText = Number.isFinite(p50Delta) ? formatSignedPercent(p50Delta) : "n/a";

    console.log(
      `${padRight(r.scenario, 22)}  ${padLeft(formatThroughput(r.throughput), 14)}  ${padLeft(formatLatency(r.latency.p50), 10)}  ${padLeft(thrDeltaText, 8)}  ${padLeft(p50DeltaText, 8)}`,
    );
  }

  console.log(`\nAvg: ${formatThroughput(avgThroughput)} | ${formatLatency(avgLatency)} (P50)`);

  console.log("\n## Competitors (Throughput ranking)");
  const rows: Array<{ name: string; throughput: number; latency: number; isOurs: boolean }> = [
    ...Object.entries(competitorData).map(([name, data]: [string, any]) => ({
      name,
      throughput: data.throughput,
      latency: data.latency,
      isOurs: false,
    })),
    { name: "WebServer (Ours)", throughput: avgThroughput, latency: avgLatency, isOurs: true },
  ];

  rows.sort((a, b) => b.throughput - a.throughput);

  if (rows.length === 0) {
    throw new Error("No competitor rows to report");
  }

  const best = rows[0]!;
  const ourIndex = rows.findIndex((r) => r.isOurs);
  const ourRow = rows[ourIndex];

  console.log(`${padRight("#", 2)}  ${padRight("Framework", 16)}  ${padLeft("Throughput", 14)}  ${padLeft("P50", 10)}  ${padLeft("vs #1", 8)}`);
  console.log(`${"-".repeat(2)}  ${"-".repeat(16)}  ${"-".repeat(14)}  ${"-".repeat(10)}  ${"-".repeat(8)}`);

  rows.forEach((r, idx) => {
    const vsBest = best.throughput === 0 ? NaN : ((r.throughput - best.throughput) / best.throughput) * 100;
    const vsBestText = Number.isFinite(vsBest) ? formatSignedPercent(vsBest) : "n/a";
    const name = r.isOurs ? `${r.name}` : r.name;
    console.log(
      `${padLeft(String(idx + 1), 2)}  ${padRight(name, 16)}  ${padLeft(formatThroughput(r.throughput), 14)}  ${padLeft(formatLatency(r.latency), 10)}  ${padLeft(vsBestText, 8)}`,
    );
  });

  const wins = Object.values(competitorData).filter((d: any) => avgThroughput > d.throughput).length;
  const losses = Object.keys(competitorData).length - wins;

  console.log("\n## Result");
  console.log(`Rank: #${ourIndex + 1}/${rows.length}`);
  console.log(`Wins/Losses: ${wins}/${losses}`);

  if (ourRow && best) {
    const diffToBest = best.throughput === 0 ? NaN : ((ourRow.throughput - best.throughput) / best.throughput) * 100;
    if (Number.isFinite(diffToBest)) {
      console.log(`Gap to #1: ${formatSignedPercent(diffToBest)} ${getImprovementEmoji(diffToBest)}`);
    }
  }

  if (ourIndex === 0) {
    console.log("Status: WINNER");
  } else {
    console.log("Status: NEEDS IMPROVEMENT");
  }

  const runData: BenchmarkRun = {
    timestamp: new Date().toISOString(),
    results,
    comparison: results.map(r => ({
      scenario: r.scenario,
      throughput: r.throughput,
      latency: r.latency,
    })),
    competitors: competitorData,
    libraries: USED_LIBRARIES,
    algorithms: USED_ALGORITHMS,
  };

  // Save results
  writeFileSync("./bench/result.json", JSON.stringify(runData, null, 2));
  console.log("💾 Results saved to ./bench/result.json");

  // Generate HTML report
  generateHTMLReport(runData);
  console.log("📄 HTML report generated: ./bench/result.html\n");
}
