use ::schema::derive::SchemaDerive;
use ::schema::prelude::*;
use serde::Deserialize;

#[test]
fn test_derive_struct() {
    #[derive(Schema, Deserialize)]
    struct User {
        #[schema(min_length = 1, max_length = 100)]
        name: String,
        #[schema(min = 0, max = 150)]
        age: i64,
        #[schema(email)]
        email: String,
    }

    let schema = User::schema();

    // Test valid data
    let valid_data = serde_json::json!({
        "name": "John Doe",
        "age": 30,
        "email": "john@example.com"
    });
    assert!(schema.validate(&valid_data).is_ok());

    // Test invalid data - name too short
    let invalid_data = serde_json::json!({
        "name": "",
        "age": 30,
        "email": "john@example.com"
    });
    assert!(schema.validate(&invalid_data).is_err());

    // Test invalid data - age negative
    let invalid_data = serde_json::json!({
        "name": "John Doe",
        "age": -1,
        "email": "john@example.com"
    });
    assert!(schema.validate(&invalid_data).is_err());

    // Test invalid data - invalid email
    let invalid_data = serde_json::json!({
        "name": "John Doe",
        "age": 30,
        "email": "invalid"
    });
    assert!(schema.validate(&invalid_data).is_err());
}

#[test]
fn test_derive_enum() {
    #[derive(Schema)]
    enum Status {
        Active,
        Inactive,
        Pending,
    }

    let schema = Status::schema();

    // Test valid data
    let valid_data = serde_json::json!("Active");
    assert!(schema.validate(&valid_data).is_ok());

    // Test invalid data
    let invalid_data = serde_json::json!("Invalid");
    assert!(schema.validate(&invalid_data).is_err());
}

#[test]
fn test_derive_with_optional_fields() {
    #[derive(Schema, Deserialize)]
    struct Product {
        #[schema(min_length = 1)]
        name: String,
        #[schema(min = 0)]
        price: i64,
        description: Option<String>,
    }

    let schema = Product::schema();

    // Test valid data with optional field
    let valid_data = serde_json::json!({
        "name": "Product",
        "price": 100
    });
    assert!(schema.validate(&valid_data).is_ok());

    // Test valid data without optional field
    let valid_data = serde_json::json!({
        "name": "Product",
        "price": 100,
        "description": "A product"
    });
    assert!(schema.validate(&valid_data).is_ok());
}

#[test]
fn test_derive_with_url_validator() {
    #[derive(Schema)]
    struct Website {
        #[schema(url)]
        url: String,
    }

    let schema = Website::schema();

    // Test valid URL
    let valid_data = serde_json::json!({
        "url": "https://example.com"
    });
    assert!(schema.validate(&valid_data).is_ok());

    // Test invalid URL
    let invalid_data = serde_json::json!({
        "url": "not-a-url"
    });
    assert!(schema.validate(&invalid_data).is_err());
}

#[test]
fn test_schemaable_trait() {
    assert_eq!(String::schema().schema_type, SchemaType::String);
    assert_eq!(i64::schema().schema_type, SchemaType::Integer);
    assert_eq!(bool::schema().schema_type, SchemaType::Boolean);
}

#[test]
fn test_schemaable_vec() {
    let schema = Vec::<String>::schema();
    assert_eq!(schema.schema_type, SchemaType::Array);
}

#[test]
fn test_schemaable_option() {
    let schema = Option::<String>::schema();
    assert_eq!(schema.schema_type, SchemaType::String);
}
