# program

A small example program demonstrating dependency injection and functional effect composition using `@wts/functional`.

## Introduction

This package runs a simple `program` effect that:

- Pulls `Random` and `Console` services from the Effect environment
- Generates a random number
- Logs it via the provided `Console` service

It is designed to be tiny, readable, and easy to test.

## Design Principles

- **Type safety first**: services and effects are fully typed.
- **Separation of concerns**: side effects (console, randomness) live behind services.
- **Dependency injection**: services are provided via `Layer`.
- **Testability**: production services can be swapped with deterministic mocks.

## Installation

From the repo root:

```bash
bun install
```

## Usage

Run the program:

```bash
bun run dev
```

## Examples

- Run once:

```bash
bun run dev
```

- Run tests:

```bash
bun run test
```

## License

Private / internal workspace package.
