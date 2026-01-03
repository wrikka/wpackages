# Dependency Injection Library Comparison

This document provides a detailed comparison between `@wpackages/dependency` and other popular dependency injection libraries in the TypeScript ecosystem.

| Feature                   | @wpackages/dependency | tsyringe (Microsoft)         | injection-js (from Angular) |
| ------------------------- | --------------------- | ---------------------------- | --------------------------- |
| **API Style**             | Functional / Simple   | Decorator-rich / Fluent API  | Based on Angular v4 API     |
| **Scopes**                | Singleton, Transient  | Singleton, Scoped, Transient | Provider-based              |
| **Injection Tokens**      | Class, String, Symbol | Class, String, Symbol        | OpaqueToken, String         |
| **Constructor Injection** | ✅ Yes                | ✅ Yes                       | ✅ Yes                      |
| **Property Injection**    | ❌ No                 | ❌ No (by design)            | ✅ Yes                      |
| **Child Containers**      | ❌ No                 | ✅ Yes                       | ✅ Yes                      |
| **Optional Dependencies** | ❌ No                 | ✅ Yes                       | ✅ Yes                      |
| **Interceptors**          | ❌ No                 | ✅ Yes                       | ❌ No                       |
| **Dependencies**          | `reflect-metadata`    | `reflect-metadata`           | `reflect-metadata` polyfill |
| **Bundle Size**           | Very Small            | Lightweight                  | ~5.2K                       |

## Summary

- **@wpackages/dependency**: A minimal, straightforward DI container perfect for small projects or when you need only the basic features of singleton and transient scopes.

- **tsyringe**: A powerful and feature-rich library from Microsoft. It offers a modern, decorator-based API and advanced features like child containers and interception. It's an excellent choice for large-scale applications that require more complex dependency management.

- **injection-js**: A battle-tested library extracted from Angular's original DI system. It's robust and feature-complete but uses an API that might feel dated compared to modern alternatives.
