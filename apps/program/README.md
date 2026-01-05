# @wpackages/program

## Introduction

`@wpackages/program` is a small example application that demonstrates how to build a type-safe, testable, and composable program using `Effect-TS` with dependency injection via `Context` and `Layer`. It showcases the integration of the `@wpackages/config-manager` and `@wpackages/observability` packages to handle configuration and logging.

## Features

- ✨ **Effect Runtime (Real)**: Uses `effect` (`Effect`, `Layer`, `Context`) for typed effects and orchestration.
- 💉 **Dependency Injection**: Leverages `Context` + `Layer` to provide services like logging and configuration.
- 🔧 **Configuration Management**: Uses `@wpackages/config-manager` to load and access configuration variables.
- 📜 **Structured Logging**: Integrates with `@wpackages/observability` for structured and context-aware logging.
- 🧪 **Testable by Design**: The separation of concerns makes the core logic easy to test in isolation.

## Goal

- 🎯 **Demonstrate Best Practices**: Serve as a clear example of how to structure an application within the `wpackages` monorepo.
- 🧩 **Showcase Package Integration**: Illustrate how different packages (`config-manager`, `observability`) can be composed together.
- ✅ **Promote Testability**: Encourage writing code that is inherently testable by decoupling side effects.

## Design Principles

- **Type Safety First**: All services, effects, and configurations are fully typed to catch errors at compile time.
- **Separation of Concerns**: Side effects (like console output) are managed through dedicated services, keeping the core logic pure.
- **Explicit Dependencies**: Services are explicitly provided to the program, making the dependency graph clear and manageable.
- **Mockability**: Production services can be easily swapped with mock implementations for deterministic testing.

## Installation

Dependencies are managed at the root of the monorepo. Ensure you have run `bun install` in the root directory.

## Usage

To run the program, execute the `dev` script from this workspace using Turborepo:

```bash
turbo dev --filter=@wpackages/program
```

## Examples

### Running the Program

This command will execute the main entry point of the application.

```bash
# Run from the monorepo root
turbo dev --filter=@wpackages/program
```

### Running Tests

To run the test suite for this package:

```bash
# Run from the monorepo root
turbo test --filter=@wpackages/program
```

## License

This is an internal package and is not intended for separate distribution. It is licensed under the MIT License.
