/**
 * reactivity - Simple reactive primitives
 *
 * A minimal reactivity system inspired by SolidJS signals
 */

// Public APIs
export { createSignal } from "./apis/signal";
export { createMemo } from "./apis/memo";

// Core services (can be used for advanced cases)
export * from "./services/batch.service";
export * from "./services/effect.scope";
export * from "./services/reactive.service";
export * from "./services/resource.service";
export * from "./services/selector.service";
export * from "./services/watch.service";

// Types
export * from "./types";

