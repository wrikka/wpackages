# Comparison: @wpackages/store vs. Nanostore

This document compares the proposed features of `@wpackages/store` with the existing features of `nanostore`.

| Feature                | Nanostore                               | @wpackages/store (Proposed)    |
| ---------------------- | --------------------------------------- | ------------------------------ |
| **Bundle Size**        | ~286 bytes                              | Target: < 300 bytes            |
| **Core Stores**        | `atom`, `map`                           | `atom`, `map`                  |
| **Derived State**      | `computed`, `batched`                   | `computed`                     |
| **Lazy Loading**       | `onMount`                               | `onMount`                      |
| **Framework Support**  | React, Vue, Svelte, Solid, Lit, Angular | React, Vue, Svelte (initially) |
| **Ecosystem**          | Rich (Router, Persistent, Query, etc.)  | To be developed                |
| **TypeScript Support** | Yes                                     | Yes (First-class)              |
| **DevTools**           | Logger, Vue DevTools plugin             | To be developed                |
