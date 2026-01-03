# API Builder vs Competitors

This document provides a detailed comparison of `@wpackages/api-builder` with other popular libraries and frameworks in the TypeScript ecosystem for building APIs.

| Feature                  | @wpackages/api-builder           | effect-http                         | tRPC                     | Hono                             | Fastify                    |
| ------------------------ | -------------------------------- | ----------------------------------- | ------------------------ | -------------------------------- | -------------------------- |
| **Core Philosophy**      | Effect-TS, Functional            | Effect-TS, Declarative              | End-to-end typesafe APIs | Lightweight, Fast, Multi-runtime | Performance, Extensibility |
| **Type Safety**          | End-to-end with `@effect/schema` | End-to-end with `@effect/schema`    | End-to-end, inferred     | Middleware & Validators          | JSON Schema based          |
| **Runtime Support**      | Node.js, Bun                     | Node.js, Bun                        | Node.js, Deno, Bun, Edge | Node.js, Bun                     | Node.js                    |
| **Performance**          | High (leveraging Effect-TS)      | High (leveraging Effect-TS)         | High                     | Very High                        | Excellent                  |
| **Developer Experience** | Excellent (declarative, simple)  | Excellent (declarative, composable) | Excellent (autocomplete) | Good                             | Good                       |
| **Ecosystem**            | Growing (Effect-TS)              | Growing (Effect-TS)                 | Good                     | Growing                          | Large                      |
| **Client Generation**    | Yes (built-in)                   | Yes (built-in)                      | Yes (via plugins)        | No (external tools)              | No (external tools)        |
| **OpenAPI Generation**   | Not yet                          | Yes (built-in)                      | Yes (via plugins)        | Yes (via plugins)                | Yes (via plugins)          |
