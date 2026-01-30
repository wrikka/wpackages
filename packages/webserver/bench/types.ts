import type { BenchmarkConfig, BenchmarkResult } from "./benchmark";

export interface BenchmarkRun {
  timestamp: string;
  results: BenchmarkResult[];
  comparison: ComparisonResult[];
  competitors: CompetitorData;
  libraries: string[];
  algorithms: string[];
}

export interface ComparisonResult {
  scenario: string;
  throughput: number;
  latency: {
    p50: number;
    p95: number | null;
    p99: number;
  };
}

export interface CompetitorData {
  [name: string]: {
    throughput: number;
    latency: number;
  };
}

export interface BaselineResult {
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: number;
}
