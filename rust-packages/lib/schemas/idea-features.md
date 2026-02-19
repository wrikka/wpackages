# Idea Features สำหรับ Schema Package

## Context

### โปรเจกต์
- **ชื่อ**: Schema Validation Library (wai/foundation/schema)
- **ประเภท**: Schema validation library สำหรับ Rust
- **ตำแหน่ง**: `d:\wai\rust-packages\foundation\schema`

### Features ปัจจุบัน
- Type-Safe Validation
- Composable Validators
- Zero-Copy Parsing
- Custom Error Messages
- Schema Composition
- Performance Optimized
- Serde Integration
- Async Support

### Use Cases
- Validation ของ JSON data ใน Rust applications
- Web applications ที่ต้องการ validate input data
- API validation สำหรับ REST APIs
- Data validation สำหรับ databases
- Configuration validation

### Constraints
- ต้องรักษา performance สูง (zero-copy parsing)
- ต้องรักษา async support
- ต้อง maintain type safety
- ต้อง maintain composability
- ต้องเข้ากันได้กับ existing code

### Goals
- เพิ่ม features ที่ libraries อื่นมีแต่เรายังไม่มี
- เพิ่ม usability และ developer experience
- เพิ่ม integration กับ web frameworks
- เพิ่ม JSON Schema compliance
- เพิ่ม custom validation capabilities

---

## Idea Features

### 1. Derive Macro สำหรับ Auto-Generate Schemas

**ความสำคัญ**: High
**ความยาก**: Medium
**Impact**: High

**รายละเอียด**:
เพิ่ม derive macro `#[derive(Schema)]` สำหรับ auto-generate schemas จาก structs และ enums ซึ่งจะทำให้ users สามารถ define schemas ได้ง่ายขึ้น

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[derive(Schema)]
struct User {
    #[schema(min_length = 1, max_length = 100)]
    name: String,
    
    #[schema(min = 0, max = 150)]
    age: u32,
    
    #[schema(email)]
    email: String,
}

// สร้าง schema อัตโนมัติ
let schema = User::schema();
let result = schema.validate(&data)?;
```

**Benefits**:
- ลด boilerplate code
- เพิ่ม developer experience
- คง maintain type safety
- คง maintain performance

**Implementation Notes**:
- ใช้ proc-macro สำหรับ generate code
- Support attributes สำหรับ configure validators
- Support nested structs และ enums
- Support generic types

---

### 2. Web Framework Integration

**ความสำคัญ**: High
**ความยาก**: Medium
**Impact**: High

**รายละเอียด**:
เพิ่ม integration กับ web frameworks ที่นิยม เช่น Actix, Axum, Warp เพื่อให้ users สามารถ validate request data ได้อย่างสะดวก

**ตัวอย่างการใช้งาน**:
```rust
// Actix integration
use actix_web::{web, HttpResponse};
use schema::prelude::*;

#[derive(Schema, Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

async fn create_user(
    payload: Json<CreateUser>,
) -> Result<HttpResponse, SchemaError> {
    payload.validate()?;
    // ...
}

// Axum integration
use axum::{Json, response::IntoResponse};

async fn create_user(
    Json(payload): Json<CreateUser>,
) -> Result<impl IntoResponse, SchemaError> {
    payload.validate()?;
    // ...
}
```

**Benefits**:
- เพิ่ม usability สำหรับ web applications
- ลด boilerplate code
- คง maintain async support
- คง maintain performance

**Implementation Notes**:
- สร้าง adapters สำหรับแต่ละ framework
- Support validation errors ที่เข้ากับ framework
- Support async validation
- Support streaming validation

---

### 3. JSON Schema Compliance

**ความสำคัญ**: High
**ความยาก**: High
**Impact**: High

**รายละเอียด**:
เพิ่ม JSON Schema compliance ตาม JSON Schema Draft 2020-12 เพื่อให้ users สามารถ validate ตาม JSON Schema standard ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

// Define schema using JSON Schema
let schema = json_schema!({
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "age": {
            "type": "integer",
            "minimum": 0,
            "maximum": 150
        }
    },
    "required": ["name", "age"]
});

// Validate data
let result = schema.validate(&data)?;
```

**Benefits**:
- เพิ่ม compatibility กับ tools อื่น
- เพิ่ม interoperability
- เพิ่ม standard compliance
- เพิ่ม flexibility

**Implementation Notes**:
- Implement JSON Schema Draft 2020-12
- Support reference resolving
- Support format validation (email, uri, etc.)
- Support custom keywords

---

### 4. Rule Adapters

**ความสำคัญ**: Medium
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม rule adapters สำหรับ custom validators เพื่อให้ users สามารถ define custom validation logic ได้อย่างยืดหยุ่น

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[derive(Schema)]
struct User {
    #[schema(custom = "validate_unique_username")]
    username: String,
}

fn validate_unique_username(username: &str) -> Result<(), SchemaError> {
    // Custom validation logic
    if username == "admin" {
        return Err(SchemaError::custom("Username 'admin' is reserved"));
    }
    Ok(())
}
```

**Benefits**:
- เพิ่ม flexibility
- เพิ่ม custom validation capabilities
- คง maintain type safety
- คง maintain performance

**Implementation Notes**:
- Support custom validation functions
- Support async custom validators
- Support context access
- Support error messages

---

### 5. Context/Self Access

**ความสำคัญ**: Medium
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม context/self access ใน validators เพื่อให้ users สามารถ access context และ self ใน validation logic ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[derive(Schema)]
struct User {
    #[schema(custom = "validate_password")]
    password: String,
}

fn validate_password(
    password: &str,
    context: &ValidationContext,
) -> Result<(), SchemaError> {
    // Access context for additional data
    let min_length = context.get::<u32>("min_password_length").unwrap_or(8);
    if password.len() < min_length {
        return Err(SchemaError::custom(format!(
            "Password must be at least {} characters",
            min_length
        )));
    }
    Ok(())
}
```

**Benefits**:
- เพิ่ม flexibility
- เพิ่ม custom validation capabilities
- เพิ่ม context awareness
- คง maintain type safety

**Implementation Notes**:
- Support context access
- Support self access
- Support async context
- Support context injection

---

### 6. Newtypes Support

**ความสำคัญ**: Medium
**ความยาก**: Low
**Impact**: Medium

**รายละเอียด**:
เพิ่ม support สำหรับ newtypes เพื่อให้ users สามารถ define custom types ที่มี validation rules ได้อย่างง่าย

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[derive(Schema)]
#[schema(min_length = 3, max_length = 50)]
struct Username(String);

#[derive(Schema)]
#[schema(email)]
struct Email(String);

#[derive(Schema)]
struct User {
    username: Username,
    email: Email,
}

// Auto-generate validators for newtypes
let schema = User::schema();
let result = schema.validate(&data)?;
```

**Benefits**:
- เพิ่ม type safety
- ลด boilerplate code
- คง maintain performance
- เพิ่ม code reusability

**Implementation Notes**:
- Auto-generate validators สำหรับ newtypes
- Support nested newtypes
- Support generic newtypes
- Support custom validation rules

---

### 7. OpenAPI Support

**ความสำคัญ**: Low
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม OpenAPI specification support เพื่อให้ users สามารถ generate OpenAPI specs จาก schemas ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[derive(Schema)]
#[openapi(title = "User API", version = "1.0")]
struct User {
    #[schema(description = "User name")]
    name: String,
    
    #[schema(description = "User email")]
    email: String,
}

// Generate OpenAPI spec
let openapi = User::openapi_spec();
```

**Benefits**:
- เพิ่ม API documentation
- เพิ่ม tooling support
- เพิ่ม interoperability
- เพิ่ม developer experience

**Implementation Notes**:
- Generate OpenAPI 3.0 specs
- Support custom descriptions
- Support examples
- Support security schemes

---

### 8. Coercion Support

**ความสำคัญ**: Low
**ความยาก**: High
**Impact**: Low

**รายละเอียด**:
เพิ่ม coercion support เพื่อให้ users สามารถ coerce types ได้ เช่น string ไป integer

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

let schema = object_schema()
    .field("age", integer().min(0).max(150).coerce())
    .field("name", string().min_length(1).max_length(100))
    .build();

let data = serde_json::json!({
    "age": "30",  // String จะถูก coerce เป็น integer
    "name": "John Doe"
});

let result = schema.validate_and_coerce(&data)?;
```

**Benefits**:
- เพิ่ม flexibility
- เพิ่ม usability
- ลด manual conversions
- เพิ่ม developer experience

**Implementation Notes**:
- Support type coercion
- Support custom coercers
- Support coercion errors
- Maintain type safety

---

### 9. Schema Registry

**ความสำคัญ**: Medium
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม schema registry เพื่อให้ users สามารถ register และ reuse schemas ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

// Register schema
let registry = SchemaRegistry::new();
registry.register("user", user_schema());
registry.register("product", product_schema());

// Reuse schema
let schema = object_schema()
    .field("user", registry.get("user").unwrap())
    .field("product", registry.get("product").unwrap())
    .build();
```

**Benefits**:
- เพิ่ม schema reusability
- ลด duplication
- เพิ่ม maintainability
- เพิ่ม modularity

**Implementation Notes**:
- Support schema registration
- Support schema lookup
- Support schema composition
- Support schema validation

---

### 10. Schema Migration

**ความสำคัญ**: Low
**ความยาก**: High
**Impact**: Low

**รายละเอียด**:
เพิ่ม schema migration support เพื่อให้ users สามารถ migrate schemas ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

// Define migration
let migration = SchemaMigration::new()
    .rename_field("name", "full_name")
    .add_field("age", integer().min(0).max(150))
    .remove_field("old_field");

// Apply migration
let new_schema = migration.apply(old_schema)?;
```

**Benefits**:
- เพิ่ม schema evolution
- เพิ่ backward compatibility
- เพิ่ maintainability
- เพิ่ flexibility

**Implementation Notes**:
- Support schema versioning
- Support migration rules
- Support backward compatibility
- Support migration validation

---

### 11. Schema Documentation

**ความสำคัญ**: Medium
**ความยาก**: Low
**Impact**: Medium

**รายละเอียด**:
เพิ่ม schema documentation support เพื่อให้ users สามารถ add documentation ไปยัง schemas ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

let schema = object_schema()
    .field(
        "name",
        string()
            .min_length(1)
            .max_length(100)
            .description("User's full name")
            .example("John Doe")
    )
    .field(
        "email",
        string()
            .email()
            .description("User's email address")
            .example("john@example.com")
    )
    .description("User schema")
    .build();
```

**Benefits**:
- เพิ่ม documentation
- เพิ่ API documentation
- เพิ่ developer experience
- เพิ่ maintainability

**Implementation Notes**:
- Support field descriptions
- Support schema descriptions
- Support examples
- Support documentation generation

---

### 12. Schema Testing

**ความสำคัญ**: Medium
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม schema testing support เพื่อให้ users สามารถ test schemas ได้อย่างง่าย

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_user_schema() {
        let schema = User::schema();
        
        // Test valid data
        let valid_data = serde_json::json!({
            "name": "John Doe",
            "age": 30,
            "email": "john@example.com"
        });
        assert!(schema.validate(&valid_data).is_ok());
        
        // Test invalid data
        let invalid_data = serde_json::json!({
            "name": "",
            "age": -1,
            "email": "invalid"
        });
        assert!(schema.validate(&invalid_data).is_err());
    }
}
```

**Benefits**:
- เพิ่ testability
- เพิม code quality
- เพิม maintainability
- เพิม confidence

**Implementation Notes**:
- Support schema validation tests
- Support property-based testing
- Support test helpers
- Support test fixtures

---

### 13. Schema Serialization

**ความสำคัญ**: Medium
**ความยาก**: Low
**Impact**: Medium

**รายละเอียด**:
เพิ่ม schema serialization support เพื่อให้ users สามารถ serialize/deserialize schemas ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

let schema = User::schema();

// Serialize schema to JSON
let schema_json = serde_json::to_string(&schema)?;

// Deserialize schema from JSON
let deserialized_schema: Schema<User> = serde_json::from_str(&schema_json)?;
```

**Benefits**:
- เพิม flexibility
- เพิม persistence
- เพิม sharing
- เพิม tooling

**Implementation Notes**:
- Support JSON serialization
- Support binary serialization
- Support schema versioning
- Support schema validation

---

### 14. Schema Validation DSL

**ความสำคัญ**: Medium
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม DSL สำหรับ define schemas ที่อ่านง่ายและเขียนง่าย

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

let schema = schema! {
    object {
        name: string(min_length: 1, max_length: 100),
        age: integer(min: 0, max: 150),
        email: string(email),
    }
};

let result = schema.validate(&data)?;
```

**Benefits**:
- เพิม readability
- เพิม writability
- เพิม developer experience
- เพิม maintainability

**Implementation Notes**:
- Support DSL syntax
- Support nested schemas
- Support custom validators
- Support error messages

---

### 15. Async Custom Validators

**ความสำคัญ**: Medium
**ความยาก**: Medium
**Impact**: Medium

**รายละเอียด**:
เพิ่ม async custom validators เพื่อให้ users สามารถ define async validation logic ได้

**ตัวอย่างการใช้งาน**:
```rust
use schema::prelude::*;

#[derive(Schema)]
struct User {
    #[schema(custom = "validate_unique_username_async")]
    username: String,
}

async fn validate_unique_username_async(
    username: &str,
) -> Result<(), SchemaError> {
    // Async validation logic
    let exists = check_username_exists(username).await?;
    if exists {
        return Err(SchemaError::custom("Username already exists"));
    }
    Ok(())
}
```

**Benefits**:
- เพิม flexibility
- เพิม async support
- เพิม custom validation capabilities
- คง maintain performance

**Implementation Notes**:
- Support async validators
- Support async context
- Support async error handling
- Maintain zero-copy

---

## Priority Matrix

| Feature | Priority | Impact | Effort |
|---------|----------|--------|--------|
| Derive Macro | High | High | Medium |
| Web Framework Integration | High | High | Medium |
| JSON Schema Compliance | High | High | High |
| Rule Adapters | Medium | Medium | Medium |
| Context/Self Access | Medium | Medium | Medium |
| Newtypes Support | Medium | Medium | Low |
| Schema Registry | Medium | Medium | Medium |
| Schema Documentation | Medium | Medium | Low |
| Schema Testing | Medium | Medium | Medium |
| Schema Serialization | Medium | Medium | Low |
| Schema Validation DSL | Medium | Medium | Medium |
| Async Custom Validators | Medium | Medium | Medium |
| OpenAPI Support | Low | Medium | Medium |
| Coercion Support | Low | Low | High |
| Schema Migration | Low | Low | High |

---

## Implementation Roadmap

### Phase 1: High Priority (คาดว่าใช้ 2-3 เดือน)
1. Derive Macro
2. Web Framework Integration
3. JSON Schema Compliance

### Phase 2: Medium Priority (คาดว่าใช้ 2-3 เดือน)
4. Rule Adapters
5. Context/Self Access
6. Newtypes Support
7. Schema Registry
8. Schema Documentation
9. Schema Testing
10. Schema Serialization
11. Schema Validation DSL
12. Async Custom Validators

### Phase 3: Low Priority (คาดว่าใช้ 1-2 เดือน)
13. OpenAPI Support
14. Coercion Support
15. Schema Migration

---

## Conclusion

Schema package ของ wai มี competitive advantages ที่ชัดเจนในด้าน:
- Async Support: เป็น library เดียวที่รองรับ async validation
- Zero-Copy Parsing: Performance สูงด้วยไม่ allocate memory ที่ไม่จำเป็น
- Composable Validators: สามารถ combine validators ได้อย่างยืดหยุ่น
- Type-Safe: ใช้ประโยชน์จาก Rust's type system อย่างเต็มที่

แต่ยังขาด features ที่ libraries อื่นมี:
- Derive Macro
- Web Framework Integration
- JSON Schema Compliance
- Rule Adapters
- Context/Self Access

การเพิ่ม features เหล่านี้จะทำให้ schema package มีความสมบูรณ์มากขึ้น และเพิ่ม developer experience อย่างมาก

---

## References

- [Comparison Report](comparison-schema-validation.md)
- [jsonschema](https://github.com/Stranger6667/jsonschema)
- [valico](https://github.com/s-panferov/valico)
- [schemars](https://graham.cool/schemars/)
- [garde](https://github.com/jprochazk/garde)
- [validator](https://github.com/Keats/validator)
