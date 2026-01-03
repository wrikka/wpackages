# API Documentation

This document provides an overview of the core services in `wshell`.

## Core Services

### `ParserService`

Responsible for parsing raw string input into a structured `Command` object.

-   **`parse(input: string): Effect<Command, ParseError>`**: Takes a string and returns an `Effect` that resolves to a `Command` or fails with a `ParseError`.

### `ExecutorService`

Responsible for executing a `Command`.

-   **`execute(command: Command): Effect<void, ExecuteError>`**: Takes a `Command` object, executes it (either as a built-in or an external process), and returns an `Effect` that completes on success or fails with an `ExecuteError`.

### `DisplayService`

Responsible for displaying output to the console.

-   **`display(value: ShellValue): Effect<void, never>`**: Takes a `ShellValue` (string, table, or void) and prints it to the console.
