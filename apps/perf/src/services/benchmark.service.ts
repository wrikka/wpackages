import { performance } from 'perf_hooks';

export interface BenchmarkResult {
  name: string;
  hz: number;
  mean: number;
  p99: number;
  min: number;
  max: number;
}

export const runBenchmark = async (name: string, fn: () => void | Promise<void>, duration: number = 1000): Promise<BenchmarkResult> => {
  const samples: number[] = [];
  const startTime = performance.now();

  while (performance.now() - startTime < duration) {
    const s = performance.now();
    await fn();
    samples.push(performance.now() - s);
  }

  samples.sort((a, b) => a - b);

  const sum = samples.reduce((a, b) => a + b, 0);
  const mean = sum / samples.length;
  const p99 = samples[Math.floor(samples.length * 0.99)];

  return {
    name,
    hz: samples.length / (duration / 1000),
    mean,
    p99,
    min: samples[0],
    max: samples[samples.length - 1],
  };
};
