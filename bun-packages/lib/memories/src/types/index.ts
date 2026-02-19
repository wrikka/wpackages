export interface Memory {
  readonly id: string;
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: number;
}

export interface MemoryStore {
  readonly add: (memory: Omit<Memory, "id" | "timestamp">) => Promise<Memory>;
  readonly get: (id: string) => Promise<Memory | null>;
  readonly search: (query: string, limit?: number) => Promise<Memory[]>;
  readonly delete: (id: string) => Promise<void>;
  readonly list: (limit?: number) => Promise<Memory[]>;
}
