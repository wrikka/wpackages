# @wpackages/macros

## Introduction

`@wpackages/macros` is a special package within the monorepo that houses a collection of code macros for different languages and runtimes, primarily **Bun (TypeScript)** and **Rust**. These macros are designed to reduce boilerplate, enhance developer experience, and provide powerful compile-time functionalities.

## Goal

-   🎯 **Centralize Macros**: To provide a single, organized location for all procedural and compile-time macros used across the `wpackages` monorepo.
-   🧑‍💻 **Improve DX**: To abstract away repetitive code patterns and provide expressive, high-level APIs through macros.
-   🚀 **Enhance Performance**: To leverage compile-time code generation for improved runtime performance where applicable.

## Design Principles

-   **Language-Idiomatic**: Macros are designed to feel natural and idiomatic within their respective languages (Rust and TypeScript/Bun).
-   **Clear and Focused**: Each macro has a single, well-defined purpose.
-   **Well-Documented**: Usage for each macro is clearly documented with examples.

## Available Macros

This package is not a standard installable NPM package but a collection of sub-projects.

### Bun (TypeScript) Macros

Located in the `bun/` directory. These macros are intended for use with the Bun runtime.

#### `log`

A macro that enhances `console.log` to automatically include the file path and line number of the call site, making debugging significantly easier.

**Usage:**

```typescript
import { log } from './bun/src/index';

const user = {
  name: 'John Doe',
  age: 30
};

log('User object:', user);
// Expected output will include file path and line number, e.g.:
// [src/my-file.ts:10] User object: { name: 'John Doe', age: 30 }
```

### Rust Macros

Located in the `rust/` directory. These are procedural macros for use in Rust workspaces.

#### `Builder`

A procedural `derive` macro that automatically implements the Builder Pattern for any struct. This is extremely useful for constructing complex objects in a clean and readable way.

**Usage:**

```rust
use w_proc_macros::Builder;

#[derive(Builder)]
pub struct Command {
    executable: String,
    args: Vec<String>,
    env: Vec<String>,
    current_dir: String,
}

fn main() {
    let command = Command::builder()
        .executable("cargo".to_string())
        .args(vec!["build".to_string(), "--release".to_string()])
        .env(vec![])
        .current_dir(".".to_string())
        .build()
        .unwrap();

    assert_eq!(command.executable, "cargo");
}
```

## License

This project is licensed under the MIT License.
