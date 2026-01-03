# @wpackages/generate

## Introduction

`@wpackages/generate` is a powerful and flexible code generation library for scaffolding components, modules, services, tests, and more. It features a rich template engine with built-in helpers, a suite of specialized generators, and a functional, type-safe API, making it easy to automate boilerplate code creation.

## Features

- 🎨 **Powerful Template Engine**: Uses a simple syntax (`{{ variable }}`) with built-in helper functions for case conversion (`{{ pascal name }}`) and more.
- 🧩 **Specialized Generators**: Includes dedicated generators for common tasks like creating components, modules, and tests.
- 📝 **Built-in & Custom Templates**: Comes with ready-to-use templates for React, Vue, and TypeScript, and makes it easy to provide your own.
- ⚡ **Functional API**: Offers both class-based and pure functional APIs for creating and running generators.
- 🔄 **Batch Generation**: Efficiently generate multiple files in series or parallel.
- ✅ **Template Validation**: Validate templates against a set of variables before generation to catch errors early.
- 📦 **Zero Dependencies**: The core templating and generation logic has zero external production dependencies.

## Goal

- 🎯 **Accelerate Development**: Automate the creation of boilerplate code to save time and reduce manual errors.
- 📏 **Enforce Consistency**: Ensure that all generated code adheres to project-specific conventions and architectural patterns.
- 🧑‍💻 **Improve Developer Experience**: Provide a simple, powerful, and flexible API for all code generation needs.

## Design Principles

- **Template-Driven**: The core of the library is a powerful and flexible template rendering system.
- **Composability**: Generators are designed to be small, focused, and easily combined to build complex scaffolding workflows.
- **Extensibility**: The system is designed to be easily extended with custom generators and templates.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The library provides functional helpers for common generation tasks.

### Example: Generating a Component and a Service

```typescript
import { generateCode, generateComponent } from "@wpackages/generate";

// 1. Generate a React component with a test file
await generateComponent("UserProfile", {
	outputDir: "./src/components",
	framework: "react",
	withTest: true,
	variables: {
		name: "UserProfile",
		description: "A component to display a user profile.",
	},
});

// 2. Generate a service file from a custom template
const serviceTemplate = `
import { Effect } from 'effect';

// {{ description }}
export class {{ pascal name }} extends Context.Tag('{{ pascal name }}')<{{ pascal name }}, {}> {}`;

await generateCode("UserService", serviceTemplate, {
	outputDir: "./src/services",
	variables: {
		name: "UserService",
		description: "Service for managing users.",
	},
});
```

### Template Syntax

Templates use `{{ }}` for variable substitution and can apply helper functions for transformations.

```typescript
const template =
	`export const {{ camel name }} = () => 'Hello, {{ pascal name }}!';`;

// With variables: { name: 'my component' }
// Renders to:   export const myComponent = () => 'Hello, MyComponent!';
```

**Built-in Helpers:** `pascal`, `camel`, `kebab`, `snake`, `constant`, `plural`, `singular`.

## License

This project is licensed under the MIT License.
