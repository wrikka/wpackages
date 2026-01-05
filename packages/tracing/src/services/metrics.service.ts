import type { Counter, Meter, MeterProvider, MetricExporter, MetricReader } from "../types/metrics";

// --- In-Memory Storage for Metrics ---
const counters = new Map<string, { value: number; attributes: Record<string, unknown> }>();

// --- API Implementations ---

class CounterImpl implements Counter {
  constructor(private readonly _name: string) {}

  add(value: number, attributes: Record<string, unknown> = {}): void {
    // A real implementation would handle attribute aggregation more robustly.
    const key = `${this._name}${JSON.stringify(attributes)}`;
    const current = counters.get(key) || { value: 0, attributes };
    current.value += value;
    counters.set(key, current);
  }
}

class MeterImpl implements Meter {
  createCounter(name: string): Counter {
    return new CounterImpl(name);
  }
}

export class MeterProviderImpl implements MeterProvider {
  getMeter(_name: string, _version?: string): Meter {
    // For now, return a single meter instance.
    return new MeterImpl();
  }
}

// --- Exporters and Readers ---

export class ConsoleMetricExporter implements MetricExporter {
  async export(metrics: any): Promise<void> {
    console.log("--- Metrics Export ---");
    for (const [key, metric] of metrics.counters.entries()) {
      console.log(`${key}: ${metric.value}`, metric.attributes);
    }
    console.log("----------------------");
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

export class InMemoryMetricReader implements MetricReader {
  async collect(): Promise<any> {
    return { counters };
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
