# Comparison of @wpackages/queue with other libraries

This document compares `@wpackages/queue` with other popular task and job queue libraries in the JavaScript/TypeScript ecosystem.

## Key Differentiators

`@wpackages/queue` is designed to be a **simple, type-safe, in-memory task manager** built for applications that already use the `effect-ts` ecosystem. It is not a persistent, distributed job queue system like BullMQ.

Its primary goal is to provide a higher-level abstraction over `effect` primitives for managing the lifecycle of concurrent tasks (pending, running, completed, failed) within a single process.

## Feature Comparison

| Feature                 | `@wpackages/queue`                               | [BullMQ](https://bullmq.io/)                      | [p-queue](https://github.com/sindresorhus/p-queue) | `Effect.Queue`                                       |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| **Primary Use Case**    | In-memory task management within an `effect` app | Distributed, persistent background job processing | Promise concurrency limiting                       | Low-level concurrent fiber communication channel     |
| **Paradigm**            | Functional (`effect-ts`)                         | Class-based, Event-driven                         | Promise-based                                      | Functional (`effect-ts`)                             |
| **Persistence**         | No (In-memory only)                              | Yes (Redis-backed)                                | No (In-memory only)                                | No (In-memory only)                                  |
| **Distributed**         | No (Single process)                              | Yes (Multi-worker/multi-server)                   | No (Single process)                                | No (Designed for inter-fiber communication)          |
| **Concurrency Control** | Yes (`maxConcurrent`)                            | Yes (Concurrency per worker)                      | Yes (`concurrency` option)                         | Yes (Bounded queues provide back-pressure)           |
| **Retries**             | Yes (Built-in, configurable)                     | Yes (Built-in, highly configurable)               | No (Requires manual implementation)                | No (Requires manual implementation using `Schedule`) |
| **Timeouts**            | Yes (Built-in, configurable)                     | Yes (Built-in)                                    | Yes (via `AbortController` or similar)             | No (Requires manual implementation)                  |
| **Priority Queue**      | Yes (Optional)                                   | Yes (Built-in)                                    | Yes (Built-in)                                     | No (FIFO only)                                       |
| **Type Safety**         | Excellent (via `effect-ts`)                      | Good (Written in TypeScript)                      | Good (Written in TypeScript)                       | Excellent (Core `effect-ts` feature)                 |

## Summary

- **Choose `@wpackages/queue` when:**
  - You are building an application with `effect-ts`.
  - You need to manage the lifecycle of concurrent, in-memory tasks.
  - You need features like retries, timeouts, and priority handling out-of-the-box.
  - You do not need persistence or multi-server distribution.

- **Choose `BullMQ` when:**
  - You need a robust, persistent background job system.
  - Your jobs need to be processed by multiple workers or on multiple servers.
  - You need advanced features like rate limiting, repeatable jobs, and a UI dashboard.

- **Choose `p-queue` when:**
  - You are working in a standard Promise-based Node.js project.
  - Your primary need is to limit the concurrency of promise-resolving functions.

- **Choose `Effect.Queue` when:**
  - You need a low-level, highly-performant primitive for communication between `Fiber`s in `effect-ts`.
  - You want to build your own custom queuing logic with back-pressure.
