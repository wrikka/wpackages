export interface PerformanceSettings {
  cpuLimitPercent: number; // 0-100
  memoryLimitMB: number;
}

export interface AppSettings {
  sandboxMode: boolean;
  performance: PerformanceSettings;
}
