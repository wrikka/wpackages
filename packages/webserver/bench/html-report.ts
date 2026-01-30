import type { BenchmarkRun } from "./types";
import { formatNumber, formatLatency } from "./formatters";

export function generateHTMLReport(data: BenchmarkRun): void {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>WebServer Benchmark Results</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 10px; }
        .meta { color: #666; margin-bottom: 30px; }
        h2 { color: #444; margin: 20px 0 10px; padding-bottom: 5px; border-bottom: 2px solid #eee; }
        .section { margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        tr:hover { background: #f8f9fa; }
        .metric { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .improvement { color: #28a745; font-weight: 600; }
        .regression { color: #dc3545; font-weight: 600; }
        .libraries, .algorithms { background: #e7f3ff; padding: 15px; border-radius: 4px; }
        .libraries ul, .algorithms ul { list-style: none; padding: 0; }
        .libraries li, .algorithms li { padding: 5px 0; }
        .winner { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .loser { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 WebServer Benchmark Results</h1>
        <p class="meta"><strong>Timestamp:</strong> ${data.timestamp}</p>

        <div class="section">
            <h2>📦 Libraries & Algorithms Used</h2>
            <div class="libraries">
                <h3>Libraries:</h3>
                <ul>
                    ${data.libraries.map(lib => `<li>• ${lib}</li>`).join('')}
                </ul>
            </div>
            <div class="algorithms">
                <h3>Algorithms:</h3>
                <ul>
                    ${data.algorithms.map(algo => `<li>• ${algo}</li>`).join('')}
                </ul>
            </div>
        </div>

        <h2>🏆 Competitor Comparison</h2>
        <table>
            <thead>
                <tr>
                    <th>Framework</th>
                    <th>Throughput (req/s)</th>
                    <th>Latency (ms)</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(data.competitors).map(([name, data]: [string, any]) => `
                <tr>
                    <td><strong>${name}</strong></td>
                    <td>${formatNumber(data.throughput)}</td>
                    <td>${formatLatency(data.latency)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>📊 Our Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>Throughput (req/s)</th>
                    <th>Latency P50 (ms)</th>
                    <th>Latency P95 (ms)</th>
                    <th>Latency P99 (ms)</th>
                </tr>
            </thead>
            <tbody>
                ${data.comparison.map((r: any) => `
                <tr>
                    <td>${r.scenario}</td>
                    <td>${formatNumber(r.throughput)}</td>
                    <td>${formatLatency(r.latency.p50)}</td>
                    <td>${r.latency.p95 ? formatLatency(r.latency.p95) : 'N/A'}</td>
                    <td>${formatLatency(r.latency.p99)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

  const { writeFileSync } = require("fs");
  writeFileSync("./bench/result.html", html);
}
