# TypeScript & Bun Design Patterns

This library provides a comprehensive collection of software design patterns implemented in TypeScript, tailored for the Bun runtime. Each pattern includes a clear implementation, a simple usage example, and is organized into logical categories.

## Pattern Categories

| Category | Patterns |
| :--- | :--- |
| **Creational** | `Singleton`, `Factory Method`, `Abstract Factory`, `Builder`, `Prototype` |
| **Structural** | `Adapter`, `Bridge`, `Composite`, `Decorator`, `Facade`, `Flyweight`, `Proxy` |
| **Behavioral** | `Chain of Responsibility`, `Command`, `Iterator`, `Mediator`, `Memento`, `Observer`, `State`, `Strategy`, `Template Method`, `Visitor` |
| **Concurrency** | `Actor Model`, `Async/Await Best Practices`, `Worker Threads (Bun Workers)`, `Promise-based Patterns`, `Mutex/Semaphore`, `Producer-Consumer` |
| **Architectural** | `Model-View-Controller (MVC)`, `Model-View-ViewModel (MVVM)`, `Microservices`, `Event-Driven Architecture`, `Command Query Responsibility Segregation (CQRS)` |
| **Modern & Specific**| `Dependency Injection (DI)`, `Registry`, `Result/Option Types`, `Functional Composition` |

## Structure

Each pattern is located in `src/<category>/<pattern-name>/` and contains:

- `index.ts`: The core implementation of the design pattern.
- `usage.ts`: A simple, runnable example demonstrating how to use the pattern.
