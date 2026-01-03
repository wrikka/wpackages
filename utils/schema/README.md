# @wpackages/schema

## Introduction

`@wpackages/schema` is a central library for defining, validating, and using data schemas across the entire `wpackages` monorepo. It is built on top of `@effect/schema`, a powerful and type-safe library for creating and composing schemas. This package serves as the single source of truth for the shape of data as it moves between different services and applications.

## Features

-   ✅ **Single Source of Truth**: Provides a centralized location for all shared data models and types.
-   🔒 **Type-Safe by Default**: Leverages `@effect/schema` to derive static TypeScript types directly from your schemas, eliminating inconsistencies.
-   -   **Runtime Validation**: Schemas can be used to parse and validate unknown data at runtime, ensuring data integrity.
-   -   **Composable**: Complex schemas can be built by composing simpler ones.

## Goal

-   🎯 **Data Consistency**: To ensure that all parts of the system agree on the shape of the data they exchange.
-   🛡️ **Prevent Data-Related Bugs**: To catch data-related errors at compile time (via TypeScript) and at runtime (via validation).
-   🧑‍💻 **Improve Developer Experience**: To provide clear, reusable, and self-documenting definitions for all core data structures.

## Design Principles

-   **Schema-First**: The schema is the primary definition of a data structure; the TypeScript type is derived from it.
-   **Immutability**: Schemas and the data they produce are treated as immutable.
-   **Explicitness**: All data validation and transformation rules are explicitly defined in the schema.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Schemas are defined using the `Schema` constructor from `@effect/schema` and then exported from this package to be used elsewhere.

### Example: Defining and Using a User Schema

```typescript
// in @wpackages/schema/src/user.ts
import { Schema } from "@effect/schema";

// Define the schema for a User
export const User = Schema.struct({
    id: Schema.number,
    name: Schema.string,
    email: Schema.string.pipe(Schema.pattern(/^\S+@\S+\.\S+$/)), // Add validation
    isActive: Schema.boolean.pipe(Schema.optional()),
});

// Infer the TypeScript type directly from the schema
export type User = Schema.Schema.Type<typeof User>;

// Use the schema to parse and validate unknown data
const unsafeData: unknown = { id: 1, name: 'Jane Doe', email: 'jane@example.com' };

const parsedUser = Schema.parseSync(User)(unsafeData); // Throws if invalid

console.log(parsedUser.name); // 'Jane Doe'
```

## License

This project is licensed under the MIT License.
