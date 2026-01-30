// Formatting utilities for benchmark results
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatThroughput(throughput: number): string {
  if (throughput >= 1000000) {
    return `${(throughput / 1000000).toFixed(2)}M req/s`;
  } else if (throughput >= 1000) {
    return `${(throughput / 1000).toFixed(2)}K req/s`;
  }
  return `${throughput.toFixed(0)} req/s`;
}

export function formatLatency(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  }
  return `${ms.toFixed(2)}ms`;
}

export function getImprovementEmoji(value: number): string {
  if (value > 0) return "🚀";
  if (value < 0) return "📉";
  return "➡️";
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function padRight(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

export function padLeft(value: string, width: number): string {
  return value.length >= width ? value : " ".repeat(width - value.length) + value;
}
