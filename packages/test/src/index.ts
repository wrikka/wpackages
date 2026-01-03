/**
 * @wpackages/test - Type-safe, functional testing framework
 */

// Core test functions and hooks
export { describe, it, test, beforeAll, afterAll } from './core/globals';

// Mocking and spying utilities
export { w } from './core/w';

// Assertion library
export { expect } from './utils/assertions';

// All other utilities (diff, async helpers, etc.)
export * from './utils';

// Core types
export type * from './types';

