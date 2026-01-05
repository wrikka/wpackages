export interface Meter {
  createCounter(name: string, options?: any): Counter;
}

export interface MeterProvider {
  getMeter(name: string, version?: string): Meter;
}

export interface Counter {
  add(value: number, attributes?: Record<string, unknown>): void;
}

export interface MetricReader {
  collect(): Promise<any>;
  shutdown(): Promise<void>;
}

export interface MetricExporter {
  export(metrics: any): Promise<void>;
  shutdown(): Promise<void>;
}
