/**
 * Performance Profiling for wshell
 * Command timing and profiling
 */
import { performance } from "perf_hooks";
import type { ShellValue } from "../types/value.types";
import { record, str, float, int, list } from "../types/value.types";

// Command timing result
export interface TimingResult {
  command: string;
  startTime: number;
  endTime: number;
  duration: number; // milliseconds
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
}

// Profiler
export class Profiler {
  private timings: TimingResult[] = [];
  private active: boolean = false;

  // Enable/disable profiling
  setEnabled(enabled: boolean): void {
    this.active = enabled;
  }

  // Start timing a command
  startTiming(command: string): TimingResult {
    const memoryBefore = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    return {
      command,
      startTime,
      endTime: 0,
      duration: 0,
      memoryBefore,
      memoryAfter: 0,
      memoryDelta: 0,
    };
  }

  // End timing
  endTiming(timing: TimingResult): TimingResult {
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage().heapUsed;

    const result: TimingResult = {
      ...timing,
      endTime,
      duration: endTime - timing.startTime,
      memoryAfter,
      memoryDelta: memoryAfter - timing.memoryBefore,
    };

    if (this.active) {
      this.timings.push(result);
    }

    return result;
  }

  // Profile a function
  async profile<T>(command: string, fn: () => Promise<T>): Promise<{ result: T; timing: TimingResult }> {
    const timing = this.startTiming(command);
    const result = await fn();
    const finalTiming = this.endTiming(timing);
    
    return { result, timing: finalTiming };
  }

  // Get all timings
  getTimings(): TimingResult[] {
    return [...this.timings];
  }

  // Get average duration
  getAverageDuration(): number {
    if (this.timings.length === 0) return 0;
    const total = this.timings.reduce((sum, t) => sum + t.duration, 0);
    return total / this.timings.length;
  }

  // Get slowest commands
  getSlowest(count: number = 5): TimingResult[] {
    return [...this.timings]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count);
  }

  // Clear timings
  clear(): void {
    this.timings = [];
  }

  // Export as ShellValue
  export(): ShellValue {
    return list(
      this.timings.map(t => record({
        command: str(t.command),
        duration: { _tag: "Float", value: t.duration } as const,
        memoryDelta: { _tag: "Float", value: t.memoryDelta / 1024 / 1024 } as const, // MB
      }))
    );
  }

  // Format timing for display
  formatTiming(timing: TimingResult): string {
    const duration = timing.duration.toFixed(2);
    const memory = (timing.memoryDelta / 1024).toFixed(2);
    return `${timing.command}: ${duration}ms (${memory}KB)`;
  }
}

// Global profiler
let globalProfiler: Profiler | null = null;

export function getProfiler(): Profiler {
  if (!globalProfiler) {
    globalProfiler = new Profiler();
  }
  return globalProfiler;
}

// Quick time function
export function time<T>(label: string, fn: () => T): T {
  const profiler = getProfiler();
  const timing = profiler.startTiming(label);
  
  try {
    return fn();
  } finally {
    profiler.endTiming(timing);
  }
}

// Quick async time function
export async function timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const profiler = getProfiler();
  const timing = profiler.startTiming(label);
  
  try {
    return await fn();
  } finally {
    profiler.endTiming(timing);
  }
}
