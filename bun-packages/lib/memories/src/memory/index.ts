import { Context, Effect, Layer } from "effect";
import type { Memory } from "../types";

export class MemoryError {
  readonly _tag = "MemoryError";
  constructor(readonly error: unknown) {}
}

export interface MemoryService {
  readonly addMemory: (
    content: string,
    metadata?: Record<string, unknown>,
  ) => Effect.Effect<Memory, MemoryError>;
  readonly getMemory: (
    id: string,
  ) => Effect.Effect<Memory | null, MemoryError>;
  readonly searchMemories: (
    query: string,
    limit?: number,
  ) => Effect.Effect<Memory[], MemoryError>;
  readonly deleteMemory: (id: string) => Effect.Effect<void, MemoryError>;
  readonly listMemories: (
    limit?: number,
  ) => Effect.Effect<Memory[], MemoryError>;
}

export const MemoryService = Context.GenericTag<MemoryService>("MemoryService");

export const make = Effect.gen(function* (_) {
  const memories = new Map<string, Memory>();

  const addMemory = (
    content: string,
    metadata?: Record<string, unknown>,
  ) =>
    Effect.tryPromise({
      try: async () => {
        const memory: Memory = {
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          content,
          metadata,
          timestamp: Date.now(),
        };
        memories.set(memory.id, memory);
        return memory;
      },
      catch: (error) => new MemoryError(error),
    });

  const getMemory = (id: string) =>
    Effect.succeed(memories.get(id) ?? null);

  const searchMemories = (query: string, limit = 10) =>
    Effect.succeed(
      Array.from(memories.values())
        .filter((m) => m.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit),
    );

  const deleteMemory = (id: string) =>
    Effect.sync(() => {
      memories.delete(id);
    });

  const listMemories = (limit = 50) =>
    Effect.succeed(
      Array.from(memories.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit),
    );

  return {
    addMemory,
    getMemory,
    searchMemories,
    deleteMemory,
    listMemories,
  } as MemoryService;
});

export const MemoryServiceLive = Layer.effect(MemoryService, make);
