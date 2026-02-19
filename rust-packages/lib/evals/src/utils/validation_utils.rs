//! Pure validation utility functions

use crate::error::{EvalError, EvalResult};
use crate::types::core::{EvalSample, SampleResult};
use crate::types::config::EvalConfig;

/// Validate evaluation sample
pub fn validate_sample(sample: &EvalSample) -> EvalResult<()> {
    if sample.id.trim().is_empty() {
        return Err(EvalError::invalid_configuration("Sample ID cannot be empty"));
    }

    if sample.input.trim().is_empty() {
        return Err(EvalError::invalid_configuration("Sample input cannot be empty"));
    }

    if sample.input.len() > 100_000 {
        return Err(EvalError::invalid_configuration(
            "Sample input exceeds maximum length (100,000 characters)"
        ));
    }

    if let Some(expected) = &sample.expected {
        if expected.len() > 100_000 {
            return Err(EvalError::invalid_configuration(
                "Sample expected output exceeds maximum length (100,000 characters)"
            ));
        }
    }

    Ok(())
}

/// Validate sample result
pub fn validate_sample_result(result: &SampleResult) -> EvalResult<()> {
    if result.sample_id.trim().is_empty() {
        return Err(EvalError::invalid_configuration("Sample result ID cannot be empty"));
    }

    if result.score < 0.0 || result.score > 1.0 {
        return Err(EvalError::invalid_configuration(
            "Sample result score must be between 0.0 and 1.0"
        ));
    }

    if result.output.len() > 100_000 {
        return Err(EvalError::invalid_configuration(
            "Sample result output exceeds maximum length (100,000 characters)"
        ));
    }

    Ok(())
}

/// Validate evaluation configuration
pub fn eval_config(config: &EvalConfig) -> EvalResult<()> {
    if config.name.trim().is_empty() {
        return Err(EvalError::invalid_configuration("Evaluation name cannot be empty"));
    }

    if config.name.len() > 255 {
        return Err(EvalError::invalid_configuration(
            "Evaluation name exceeds maximum length (255 characters)"
        ));
    }

    if config.model.trim().is_empty() {
        return Err(EvalError::invalid_configuration("Model name cannot be empty"));
    }

    if config.dataset.trim().is_empty() {
        return Err(EvalError::invalid_configuration("Dataset cannot be empty"));
    }

    if config.timeout_ms == 0 {
        return Err(EvalError::invalid_configuration("Timeout must be greater than 0"));
    }

    if config.timeout_ms > 300_000 {
        return Err(EvalError::invalid_configuration(
            "Timeout exceeds maximum allowed (300,000 ms = 5 minutes)"
        ));
    }

    if config.max_concurrent_samples == 0 {
        return Err(EvalError::invalid_configuration(
            "Max concurrent samples must be greater than 0"
        ));
    }

    if config.max_concurrent_samples > 100 {
        return Err(EvalError::invalid_configuration(
            "Max concurrent samples exceeds maximum allowed (100)"
        ));
    }

    if let Some(max_samples) = config.max_samples {
        if max_samples == 0 {
            return Err(EvalError::invalid_configuration(
                "Max samples must be greater than 0 if specified"
            ));
        }

        if max_samples > 10_000 {
            return Err(EvalError::invalid_configuration(
                "Max samples exceeds maximum allowed (10,000)"
            ));
        }
    }

    Ok(())
}

/// Validate string is not empty or just whitespace
pub fn validate_non_empty_string(value: &str, field_name: &str) -> EvalResult<()> {
    if value.trim().is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }
    Ok(())
}

/// Validate string length is within bounds
pub fn validate_string_length(
    value: &str,
    field_name: &str,
    min_length: usize,
    max_length: usize,
) -> EvalResult<()> {
    let len = value.len();
    
    if len < min_length {
        return Err(EvalError::invalid_configuration(
            format!("{} must be at least {} characters", field_name, min_length)
        ));
    }

    if len > max_length {
        return Err(EvalError::invalid_configuration(
            format!("{} must be at most {} characters", field_name, max_length)
        ));
    }

    Ok(())
}

/// Validate numeric value is within bounds
pub fn validate_numeric_bounds<T>(
    value: T,
    field_name: &str,
    min: T,
    max: T,
) -> EvalResult<()>
where
    T: PartialOrd + std::fmt::Display,
{
    if value < min {
        return Err(EvalError::invalid_configuration(
            format!("{} must be at least {}", field_name, min)
        ));
    }

    if value > max {
        return Err(EvalError::invalid_configuration(
            format!("{} must be at most {}", field_name, max)
        ));
    }

    Ok(())
}

/// Validate collection is not empty
pub fn validate_non_empty_collection<T>(collection: &[T], field_name: &str) -> EvalResult<()> {
    if collection.is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }
    Ok(())
}

/// Validate collection size is within bounds
pub fn validate_collection_size<T>(
    collection: &[T],
    field_name: &str,
    min_size: usize,
    max_size: usize,
) -> EvalResult<()> {
    let size = collection.len();
    
    if size < min_size {
        return Err(EvalError::invalid_configuration(
            format!("{} must contain at least {} items", field_name, min_size)
        ));
    }

    if size > max_size {
        return Err(EvalError::invalid_configuration(
            format!("{} must contain at most {} items", field_name, max_size)
        ));
    }

    Ok(())
}

/// Validate URL format
pub fn validate_url(url: &str, field_name: &str) -> EvalResult<()> {
    if url.trim().is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }

    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(EvalError::invalid_configuration(
            format!("{} must start with http:// or https://", field_name)
        ));
    }

    // Basic URL validation
    if let Err(_) = url::Url::parse(url) {
        return Err(EvalError::invalid_configuration(
            format!("{} is not a valid URL", field_name)
        ));
    }

    Ok(())
}

/// Validate email format
pub fn validate_email(email: &str, field_name: &str) -> EvalResult<()> {
    if email.trim().is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }

    // Basic email validation
    if !email.contains('@') || !email.contains('.') {
        return Err(EvalError::invalid_configuration(
            format!("{} is not a valid email address", field_name)
        ));
    }

    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return Err(EvalError::invalid_configuration(
            format!("{} is not a valid email address", field_name)
        ));
    }

    let local_part = parts[0];
    let domain_part = parts[1];

    if local_part.is_empty() || domain_part.is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} is not a valid email address", field_name)
        ));
    }

    if !domain_part.contains('.') {
        return Err(EvalError::invalid_configuration(
            format!("{} is not a valid email address", field_name)
        ));
    }

    Ok(())
}

/// Validate file path exists
pub async fn validate_file_exists(path: &str, field_name: &str) -> EvalResult<()> {
    if path.trim().is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }

    let path_obj = std::path::Path::new(path);
    if !tokio::fs::metadata(path_obj).await.is_ok() {
        return Err(EvalError::invalid_configuration(
            format!("{} path does not exist: {}", field_name, path)
        ));
    }

    Ok(())
}

/// Validate directory exists or can be created
pub async fn validate_directory(path: &str, field_name: &str) -> EvalResult<()> {
    if path.trim().is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }

    let path_obj = std::path::Path::new(path);
    
    if path_obj.exists() {
        if !path_obj.is_dir() {
            return Err(EvalError::invalid_configuration(
                format!("{} is not a directory: {}", field_name, path)
            ));
        }
    } else {
        // Try to create directory
        if let Err(e) = tokio::fs::create_dir_all(path_obj).await {
            return Err(EvalError::invalid_configuration(
                format!("Cannot create directory {}: {}", field_name, e)
            ));
        }
    }

    Ok(())
}

/// Validate JSON string
pub fn validate_json(json_str: &str, field_name: &str) -> EvalResult<()> {
    if json_str.trim().is_empty() {
        return Err(EvalError::invalid_configuration(
            format!("{} cannot be empty", field_name)
        ));
    }

    if let Err(e) = serde_json::from_str::<serde_json::Value>(json_str) {
        return Err(EvalError::invalid_configuration(
            format!("{} is not valid JSON: {}", field_name, e)
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::core::EvalSample;

    #[test]
    fn test_validate_sample() {
        let valid_sample = EvalSample::new(
            "test".to_string(),
            "Hello world".to_string(),
            Some("expected".to_string()),
            serde_json::Value::Null,
        );
        assert!(validate_sample(&valid_sample).is_ok());

        let invalid_sample = EvalSample::new(
            "".to_string(),
            "Hello world".to_string(),
            None,
            serde_json::Value::Null,
        );
        assert!(validate_sample(&invalid_sample).is_err());
    }

    #[test]
    fn test_validate_non_empty_string() {
        assert!(validate_non_empty_string("hello", "test").is_ok());
        assert!(validate_non_empty_string("", "test").is_err());
        assert!(validate_non_empty_string("   ", "test").is_err());
    }

    #[test]
    fn test_validate_string_length() {
        assert!(validate_string_length("hello", "test", 3, 10).is_ok());
        assert!(validate_string_length("hi", "test", 3, 10).is_err());
        assert!(validate_string_length("this is too long", "test", 3, 10).is_err());
    }

    #[test]
    fn test_validate_numeric_bounds() {
        assert!(validate_numeric_bounds(5, "test", 1, 10).is_ok());
        assert!(validate_numeric_bounds(0, "test", 1, 10).is_err());
        assert!(validate_numeric_bounds(11, "test", 1, 10).is_err());
    }

    #[test]
    fn test_validate_non_empty_collection() {
        assert!(validate_non_empty_collection(&[1, 2, 3], "test").is_ok());
        assert!(validate_non_empty_collection::<i32>(&[], "test").is_err());
    }

    #[test]
    fn test_validate_collection_size() {
        assert!(validate_collection_size(&[1, 2, 3], "test", 1, 10).is_ok());
        assert!(validate_collection_size(&[1], "test", 2, 10).is_err());
        assert!(validate_collection_size(&[1, 2, 3, 4, 5], "test", 1, 4).is_err());
    }

    #[test]
    fn test_validate_url() {
        assert!(validate_url("https://example.com", "test").is_ok());
        assert!(validate_url("http://example.com", "test").is_ok());
        assert!(validate_url("ftp://example.com", "test").is_err());
        assert!(validate_url("not-a-url", "test").is_err());
        assert!(validate_url("", "test").is_err());
    }

    #[test]
    fn test_validate_email() {
        assert!(validate_email("test@example.com", "test").is_ok());
        assert!(validate_email("user.name@domain.co.uk", "test").is_ok());
        assert!(validate_email("not-an-email", "test").is_err());
        assert!(validate_email("@domain.com", "test").is_err());
        assert!(validate_email("user@", "test").is_err());
        assert!(validate_email("", "test").is_err());
    }

    #[test]
    fn test_validate_json() {
        assert!(validate_json(r#"{"key": "value"}"#, "test").is_ok());
        assert!(validate_json(r#"[]"#, "test").is_ok());
        assert!(validate_json(r#""string""#, "test").is_ok());
        assert!(validate_json(r#"{"invalid": json}"#, "test").is_err());
        assert!(validate_json("", "test").is_err());
    }
}
