// Sample benchmark configuration and scenarios
import type { BenchmarkConfig } from "./benchmark";

export const sampleConfigs: BenchmarkConfig[] = [
  {
    framework: "webserver",
    url: "http://localhost:3000/health",
    connections: 50,
    pipelining: 1,
    duration: 10,
  },
  {
    framework: "webserver",
    url: "http://localhost:3000/api/data/123",
    connections: 100,
    pipelining: 1,
    duration: 10,
  },
  {
    framework: "webserver",
    url: "http://localhost:3000/api/data",
    connections: 75,
    pipelining: 1,
    duration: 10,
  },
];

export const baselineResults = {
  "GET /health": {
    latency: { p50: 0.001, p95: 0.005, p99: 0.01 },
    throughput: 120000, // Elysia/Hono on Bun - simple endpoint
  },
  "GET /api/data/123": {
    latency: { p50: 0.002, p95: 0.008, p99: 0.015 },
    throughput: 95000, // With path params
  },
  "POST /api/data": {
    latency: { p50: 0.003, p95: 0.01, p99: 0.02 },
    throughput: 85000, // With JSON body parsing
  },
};

// Additional competitor data for comparison
export const competitorData = {
  "Elysia": { throughput: 120000, latency: 0.001 },
  "Hono": { throughput: 100000, latency: 0.0015 },
  "Fastify": { throughput: 45000, latency: 0.005 },
  "Express": { throughput: 15000, latency: 0.01 },
  "Nitro/H3": { throughput: 60000, latency: 0.003 },
};
