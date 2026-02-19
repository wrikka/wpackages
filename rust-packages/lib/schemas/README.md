# Schema Validation Library

A type-safe, high-performance schema validation library with zero-copy parsing and composable validators.

## Overview

This library provides a comprehensive schema validation solution for Rust applications, designed to be more flexible and performant than garde. It offers:

- **Type-Safe Validation**: Leverages Rust's type system for compile-time safety
- **Composable Validators**: Combine multiple validators with `min()`, `max()`, `email()`, `url()`, and `pattern()`
- **Zero-Copy Parsing**: Efficient validation without unnecessary allocations
- **Custom Error Messages**: Detailed, context-rich error reporting with path tracking
- **Schema Composition**: Build complex schemas from simple primitives
- **Performance Optimized**: Minimal overhead, fast validation
- **Serde Integration**: Seamless integration with serde for serialization
- **Async Support**: Async validation capabilities

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
schema = { path = "rust-packages/foundation/schema" }
```

## Quick Start

```rust
use ::schema::prelude::*;

#[tokio::main]
async fn main() -> Result<(), SchemaError> {
    let schema = object_schema()
        .field("name", string().min_length(1).max_length(100))
        .field("age", integer().min(0).max(150))
        .field("email", string().email())
        .build();

    let data = serde_json::json!({
        "name": "John Doe",
        "age": 30,
        "email": "john@example.com"
    });

    let result = schema.validate(&data)?;
    println!("Validation successful: {:?}", result);

    Ok(())
}
```

## Schema Types

### String Schema

```rust
let schema = string()
    .min_length(1)
    .max_length(100)
    .email();
```

### Integer Schema

```rust
let schema = integer()
    .min(0)
    .max(150);
```

### Float Schema

```rust
let schema = float()
    .range(0.0, 100.0);
```

### Boolean Schema

```rust
let schema = boolean();
```

### Array Schema

```rust
let schema = array()
    .items(string())
    .min_items(1)
    .max_items(10);
```

### Object Schema

```rust
let schema = object_schema()
    .field("name", string().min_length(1))
    .field("age", integer().min(0))
    .required("name");
```

## Validators

### String Validators

- `min_length(n)`: Minimum string length
- `max_length(n)`: Maximum string length
- `email()`: Email validation
- `url()`: URL validation
- `pattern(regex)`: Regex pattern matching

### Number Validators

- `min(n)`: Minimum value
- `max(n)`: Maximum value
- `range(min, max)`: Value range

### Array Validators

- `min_items(n)`: Minimum array length
- `max_items(n)`: Maximum array length
- `items(schema)`: Item schema

## Error Handling

The library provides detailed error messages with path tracking:

```rust
match schema.validate(&data) {
    Ok(_) => println!("Validation successful"),
    Err(SchemaError::ValidationError { message, path }) => {
        println!("Validation failed at {}: {}", path.unwrap_or_else(|| "root".to_string()), message);
    }
    Err(e) => println!("Error: {}", e),
}
```

## Async Validation

```rust
use ::schema::services::ValidatorService;

let schema = string().min_length(1).max_length(100);
let service = ValidatorService::new(schema);

let test_value: serde_json::Value = "test".into();
service.validate_async(test_value).await?;
```

## Architecture

The library follows a layered architecture:

- **types**: Core schema type definitions
- **components**: Pure validation logic and validators
- **services**: I/O operations and async validation
- **adapters**: External library integrations
- **utils**: Helper functions and utilities
- **constants**: Constants and configuration

## Performance

The library is designed for performance:

- Zero-copy parsing where possible
- Minimal allocations
- Efficient validator chaining
- Async support for non-blocking operations

## Configuration

The library supports configuration through `Config.toml`:

```toml
[validation]
max_depth = 10
max_string_length = 10000
max_array_length = 1000
enable_zero_copy = true

[performance]
parallel_validation = true
cache_validators = true

[errors]
include_context = true
include_path = true
include_value = true
```

## Testing

The library includes comprehensive tests:

```bash
cargo test
```

## License

MIT
