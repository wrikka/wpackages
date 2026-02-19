# w-proc-macros

A collection of useful Rust procedural macros for reducing boilerplate code.

## Features

- `#[derive(Builder)]` - Automatically generate builder pattern for structs with attributes support
- `#[derive(Getters)]` - Automatically generate getter methods for struct fields with attributes support
- `#[derive(New)]` - Automatically generate `new()` constructor for structs
- `#[derive(Setters)]` - Automatically generate setter methods for struct fields

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
w-proc-macros = "0.1.0"
```

## Usage

### Builder

Generate a builder pattern for your struct with support for attributes:

```rust
use w_proc_macros::Builder;

#[derive(Builder)]
struct MyStruct {
    name: String,
    age: u32,
    active: bool,
}

// Usage
let instance = MyStruct::builder()
    .name("Alice".to_string())
    .age(30)
    .active(true)
    .build()?;
```

#### Builder Attributes

**Skip fields:**
```rust
#[derive(Builder)]
struct MyStruct {
    name: String,
    #[builder(skip)]
    internal_id: u32,
}
```

**Default values:**
```rust
#[derive(Builder)]
struct MyStruct {
    name: String,
    #[builder(default = "0")]
    count: u32,
}
```

**Optional fields:**
```rust
#[derive(Builder)]
struct MyStruct {
    name: String,
    optional_field: Option<String>, // Automatically defaults to None
}
```

### Getters

Generate getter methods for all struct fields with attributes support:

```rust
use w_proc_macros::Getters;

#[derive(Getters)]
struct MyStruct {
    name: String,
    age: u32,
}

// Usage
let instance = MyStruct {
    name: "Alice".to_string(),
    age: 30,
};

let name = instance.name(); // &String
let age = instance.age();   // &u32
```

#### Getter Attributes

**Skip fields:**
```rust
#[derive(Getters)]
struct MyStruct {
    name: String,
    #[getter(skip)]
    internal_state: u32,
}
```

**Return by copy:**
```rust
#[derive(Getters)]
struct MyStruct {
    #[getter(copy)]
    id: u32,
    name: String,
}
```

### New

Generate a `new()` constructor:

```rust
use w_proc_macros::New;

#[derive(New)]
struct MyStruct {
    name: String,
    age: u32,
}

// Usage
let instance = MyStruct::new("Alice".to_string(), 30);
```

### Setters

Generate setter methods for all struct fields:

```rust
use w_proc_macros::Setters;

#[derive(Setters)]
struct MyStruct {
    name: String,
    age: u32,
    active: bool,
}

// Usage
let mut instance = MyStruct {
    name: "Alice".to_string(),
    age: 30,
    active: true,
};

instance.set_name("Bob".to_string());
instance.set_age(31);
instance.set_active(false);
```

## Advanced Examples

### Combined Usage

```rust
use w_proc_macros::{Builder, Getters, New};

#[derive(Builder, Getters, New)]
struct User {
    id: u32,
    name: String,
    #[builder(default = "true")]
    active: bool,
    #[builder(skip)]
    created_at: u64,
}

// Using New
let user1 = User::new(1, "Alice".to_string());

// Using Builder
let user2 = User::builder()
    .id(2)
    .name("Bob".to_string())
    .build()?;

// Using Getters
println!("User: {}", user2.name());
```

## Development

```bash
cargo test
cargo clippy
cargo fmt
```

## License

MIT
