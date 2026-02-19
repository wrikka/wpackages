use ::schema::prelude::*;

#[tokio::test]
async fn test_string_validation() {
    let schema = string().min_length(1).max_length(100).email();

    assert!(schema
        .validate(&serde_json::json!("test@example.com"))
        .is_ok());
    assert!(schema.validate(&serde_json::json!("")).is_err());
    assert!(schema
        .validate(&serde_json::json!("invalid-email"))
        .is_err());
}

#[tokio::test]
async fn test_integer_validation() {
    let schema = integer().min(0).max(150);

    assert!(schema.validate(&serde_json::json!(50)).is_ok());
    assert!(schema.validate(&serde_json::json!(-1)).is_err());
    assert!(schema.validate(&serde_json::json!(200)).is_err());
}

#[tokio::test]
async fn test_object_validation() {
    let schema = object_schema()
        .field("name", string().min_length(1))
        .field("age", integer().min(0))
        .required("name");

    let valid_data = serde_json::json!({
        "name": "John Doe",
        "age": 30
    });

    let invalid_data = serde_json::json!({
        "age": 30
    });

    assert!(schema.validate(&valid_data).is_ok());
    assert!(schema.validate(&invalid_data).is_err());
}

#[tokio::test]
async fn test_array_validation() {
    let schema = array().items(string()).min_items(1).max_items(10);

    assert!(schema.validate(&serde_json::json!(["a", "b", "c"])).is_ok());
    assert!(schema.validate(&serde_json::json!([])).is_err());
}

#[tokio::test]
async fn test_async_validation() {
    use ::schema::services::ValidatorService;

    let schema = string().min_length(1).max_length(100);
    let service = ValidatorService::new(schema);

    let test_value: serde_json::Value = "test".into();
    let empty_value: serde_json::Value = "".into();
    assert!(service.validate_async(test_value).await.is_ok());
    assert!(service.validate_async(empty_value).await.is_err());
}

#[tokio::test]
async fn test_complex_schema() {
    let schema = object_schema()
        .field("name", string().min_length(1).max_length(100))
        .field("age", integer().min(0).max(150))
        .field("email", string().email())
        .field("tags", array().items(string()).min_items(1))
        .required("name")
        .required("email");

    let data = serde_json::json!({
        "name": "John Doe",
        "age": 30,
        "email": "john@example.com",
        "tags": ["developer", "rust"]
    });

    assert!(schema.validate(&data).is_ok());
}
