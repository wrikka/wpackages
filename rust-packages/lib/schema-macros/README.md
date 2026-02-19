# Schema Derive

A procedural macro crate for deriving schema definitions from Rust structs and enums. This crate provides a `#[derive(Schema)]` macro that automatically generates schema implementations for data validation and serialization.

## Features

- **Automatic Schema Generation**: Derive schemas for structs and enums with a single attribute
- **Type Inference**: Automatically detect field types (String, Integer, Float, Boolean, Option)
- **Validation Attributes**: Support for field-level validators via `#[schema(...)]` attributes
- **Required Field Detection**: Automatically mark non-Option fields as required
- **Enum Support**: Generate enum validators for enum types
- **Comprehensive Error Handling**: Clear error messages for unsupported types

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
schema-derive = "0.1.0"
schema = "0.1.0"  # The runtime schema library
```

## Usage

### Basic Struct Derivation

```rust
use schema_derive::Schema;

#[derive(Schema)]
struct User {
    name: String,
    age: i32,
    email: String,
    is_active: bool,
}
```

This generates an implementation of `SchemaDerive` for `User`:

```rust
impl SchemaDerive for User {
    fn schema() -> Schema {
        object_schema()
            .field("name", string())
            .field("age", integer())
            .field("email", string())
            .field("is_active", boolean())
            .required("name")
            .required("age")
            .required("email")
            .required("is_active")
            .build()
    }
}
```

### Validation Attributes

Use `#[schema(...)]` attributes to add validators to fields:

```rust
#[derive(Schema)]
struct User {
    #[schema(min_length = 3, max_length = 50)]
    name: String,
    
    #[schema(min = 18, max = 120)]
    age: i32,
    
    #[schema(email)]
    email: String,
    
    #[schema(url)]
    website: String,
}
```

#### Available Validators

- `min_length = N`: Minimum string length
- `max_length = N`: Maximum string length
- `min = N`: Minimum numeric value
- `max = N`: Maximum numeric value
- `email`: Email format validation
- `url`: URL format validation

### Optional Fields

Fields of type `Option<T>` are automatically treated as optional:

```rust
#[derive(Schema)]
struct User {
    name: String,           // Required
    age: Option<i32>,       // Optional
    bio: Option<String>,    // Optional
}
```

### Enum Derivation

Enums are automatically converted to string schemas with enum validators:

```rust
#[derive(Schema)]
enum Role {
    Admin,
    User,
    Guest,
}
```

This generates:

```rust
impl SchemaDerive for Role {
    fn schema() -> Schema {
        string()
            .with_validator(Box::new(enum_validator(vec![
                "Admin".to_string(),
                "User".to_string(),
                "Guest".to_string(),
            ])))
            .build()
    }
}
```

## Type Support

The macro supports the following Rust types:

| Rust Type | Schema Type |
|-----------|-------------|
| `String` | String |
| `str` | String |
| `i8`, `i16`, `i32`, `i64`, `isize` | Integer |
| `u8`, `u16`, `u32`, `u64`, `usize` | Integer |
| `f32`, `f64` | Float |
| `bool` | Boolean |
| `Option<T>` | Optional T |
| `Enum` | String with enum validator |

## Error Handling

The macro provides clear error messages for:

- **Unions**: Not supported (use structs or enums instead)
- **Unnamed Fields**: Only named fields are supported
- **Invalid Attributes**: Unknown validator attributes will be ignored

Note: This proc-macro uses `syn::Error` for compile-time error reporting, which provides clear error messages at compile time.

## Limitations

- Only supports structs with named fields
- Unnamed struct fields (tuple structs) are not supported
- Union types are not supported
- Generic types are not yet supported
- Complex nested types default to string schema

## Development

### Building

```bash
cargo build
```

### Testing

```bash
cargo test
```

### Running Tests with Nextest

```bash
cargo nextest run
```

### Formatting

```bash
cargo fmt
```

### Linting

```bash
cargo clippy --all-targets --all-features -- -D warnings
```

## Architecture

This crate is a procedural macro that:

1. Parses Rust struct/enum definitions using `syn`
2. Analyzes field types and attributes
3. Generates schema code using `quote`
4. Handles error cases with descriptive messages

### Key Components

- `derive_schema`: Main entry point macro
- `impl_struct_schema`: Generates schema implementations for structs
- `impl_enum_schema`: Generates schema implementations for enums
- `parse_field_validators`: Extracts and processes validation attributes
- `is_option_type`: Helper to detect Option types

## Contributing

Contributions are welcome! Please ensure:

- Code follows Rust best practices
- All tests pass
- New features include tests
- Documentation is updated

## License

MIT

## Related Crates

- `schema`: Runtime schema library for validation and serialization
- `syn`: Parsing Rust code
- `quote`: Code generation for Rust
