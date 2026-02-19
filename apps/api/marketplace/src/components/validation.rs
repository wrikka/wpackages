//! Validation Components
//!
//! Pure functions สำหรับ validation logic

use crate::types::models::{CreateExtensionRequest, UpdateExtensionRequest};
use validator::Validate;

/// Validate create extension request
pub fn validate_extension_request(req: &CreateExtensionRequest) -> Result<(), String> {
    req.validate()
        .map_err(|e| format!("Validation error: {}", e))
}

/// Validate update extension request
pub fn validate_update_request(req: &UpdateExtensionRequest) -> Result<(), String> {
    req.validate()
        .map_err(|e| format!("Validation error: {}", e))
}

/// Check if version string is valid semver
pub fn is_valid_semver(version: &str) -> bool {
    let parts: Vec<&str> = version.split('.').collect();
    if parts.len() < 2 || parts.len() > 4 {
        return false;
    }

    parts.iter().all(|part| {
        part.parse::<u32>().is_ok()
            || part
                .chars()
                .all(|c| c.is_ascii_digit() || c == '-' || c.is_ascii_alphabetic())
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid_semver() {
        assert!(is_valid_semver("1.0.0"));
        assert!(is_valid_semver("1.2.3"));
        assert!(is_valid_semver("2.0.0-beta"));
        assert!(is_valid_semver("1.0"));
        assert!(!is_valid_semver("1"));
        assert!(!is_valid_semver("1.0.0.0.0"));
        assert!(!is_valid_semver("invalid"));
    }
}
