# @wpackages/tracing

Lightweight, zero-dependency tracing primitives designed to be the foundation for observability in the `wpackages` monorepo.

## Goal

- **Standardize Tracing**: Provide a single, consistent API for creating and propagating traces.
- **Performance**: Offer a minimal, high-performance solution with near-zero overhead for no-op traces.
- **Extensibility**: Create a system that is easy to extend with custom exporters and context managers.
