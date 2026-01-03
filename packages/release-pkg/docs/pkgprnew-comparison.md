# In-depth Comparison: vs pkg.pr.new

This document provides a detailed breakdown of how the Preview Releases feature in `@wpackages/release-pkg` compares to `pkg.pr.new`.

While both tools aim to solve the problem of testing pull requests, they have fundamentally different philosophies and feature sets.

## Feature Matrix

| Feature                  | @wpackages/release-pkg | pkg.pr.new |
| ------------------------ | ---------------------- | ---------- |
| **Core Function**        | Integrated Release Tool| Dedicated Preview Tool |
| **Publish Target**       | ✅ Standard Registries | ❌ (Own Registry Only) |
| **Monorepo Support**     | ✅ (Native)            | ✅         |
| **Usage Analytics**      | ✅                     | ❌         |
| **Self-Hostable**        | ✅                     | ❌         |
| **Rollback/Unpublish**   | ✅                     | ❌         |
| **Programmatic API**     | ✅ (Type-Safe)         | ❌         |
| **Playground Links**     | ✅ (StackBlitz, etc.)  | ✅         |

## Philosophy & Key Differences

### @wpackages/release-pkg

- **Philosophy**: An all-in-one, enterprise-grade solution. Preview Releases are a core, tightly integrated feature of a complete release management tool.
- **Key Differentiator**: **Flexibility and Control**. You are not locked into a single provider. You can publish previews to standard, well-known registries (`npm`, `JSR`, etc.), which simplifies integration with existing infrastructure. Features like analytics, rollback, and self-hosting are designed for professional teams that require more control and insight into their workflows.

### pkg.pr.new

- **Philosophy**: A simple, single-purpose, zero-config tool.
- **Key Differentiator**: **Simplicity and Zero-Config**. It is incredibly easy to set up for its one specific job: creating a temporary preview URL. It's a great tool for open-source projects or teams who need a quick, no-fuss solution and don't require advanced features.

## Summary: When to Choose Which?

- **Choose `@wpackages/release-pkg` if:**
  - You need a single tool for both standard and preview releases.
  - You want to publish previews to standard registries like npm or JSR.
  - You need advanced features like usage analytics or the ability to unpublish a preview.
  - You require the ability to self-host your own preview registry.
  - You need a programmatic, type-safe API for custom integrations.

- **Choose `pkg.pr.new` if:**
  - Your only need is to quickly generate preview links for PRs.
  - You are comfortable with a hosted, third-party solution.
  - You do not need analytics, rollback, or multi-registry support.

