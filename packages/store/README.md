# @wpackages/store

A tiny, framework-agnostic state management library inspired by Nanostore.

## Features

- **Extremely small:** Aims for a minimal bundle size.
- **Atomic stores:** Isolate state for better code organization and performance.
- **Framework-friendly:** Designed to work seamlessly with modern UI frameworks.
- **Type-safe:** Written entirely in TypeScript.

## Comparison with Nanostore

| Feature               | Nanostore                 | @wpackages/store (Proposed)    |
| --------------------- | ------------------------- | ------------------------------ |
| **Bundle Size**       | ~286 bytes                | Target: < 300 bytes            |
| **Core API**          | `atom`, `map`, `computed` | `atom`, `map`, `computed`      |
| **Lazy Loading**      | `onMount`                 | `onMount`                      |
| **Framework Support** | React, Vue, Svelte, etc.  | React, Vue, Svelte (initially) |

For a more detailed comparison, see [`docs/comparison.md`](./docs/comparison.md).

## Getting Started

_Coming soon..._
