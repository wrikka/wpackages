# @wpackages/dependency

A minimal, straightforward DI container for TypeScript projects.

## Comparison

| Feature                   | @wpackages/dependency | tsyringe (Microsoft)         | injection-js (from Angular) |
| ------------------------- | --------------------- | ---------------------------- | --------------------------- |
| **API Style**             | Functional / Simple   | Decorator-rich / Fluent API  | Based on Angular v4 API     |
| **Scopes**                | Singleton, Transient  | Singleton, Scoped, Transient | Provider-based              |
| **Optional Dependencies** | ❌ No                 | ✅ Yes                       | ✅ Yes                      |
| **Child Containers**      | ❌ No                 | ✅ Yes                       | ✅ Yes                      |

For a more detailed breakdown, see the [full comparison document](./docs/comparison.md).
