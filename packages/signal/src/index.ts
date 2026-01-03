/**
 * reactivity - Simple reactive primitives
 *
 * A minimal reactivity system inspired by SolidJS signals
 */

// Public APIs
export { createMemo } from "./apis/memo";
export { createSignal } from "./apis/signal";

// Core services (can be used for advanced cases)
export * from "./services/batch.service";
export { createEffect, createEffectScope, onCleanup } from "./services/effect.scope";
export * from "./services/reactive.service";
export * from "./services/resource.service";
export * from "./services/selector.service";
export * from "./services/watch.service";

// Types
export * from "./types";
