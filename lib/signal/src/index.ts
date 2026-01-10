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

// SSR/Hydration services
export * from "./services/serialization.service";
export * from "./services/hydration.service";
export * from "./services/suspense.service";
export * from "./services/ssr.service";

// Framework integrations
export * as react from "./integrations/react";
export * as vue from "./integrations/vue";
export * as svelte from "./integrations/svelte";
export * as solid from "./integrations/solid";

// Advanced features
export * from "./features";

// Types
export * from "./types";
