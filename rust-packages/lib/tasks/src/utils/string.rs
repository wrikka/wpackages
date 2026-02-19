//! String utilities for task system
//!
//! Provides common string manipulation and validation functions.

/// Check if a string is blank (empty or whitespace only)
pub fn is_blank(s: &str) -> bool {
    s.trim().is_empty()
}

/// Check if a string is not blank
pub fn is_not_blank(s: &str) -> bool {
    !is_blank(s)
}

/// Trim and return None if blank
pub fn trim_to_none(s: &str) -> Option<String> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

/// Truncate a string to max length with ellipsis
pub fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else if max_len <= 3 {
        "...".to_string()
    } else {
        format!("{}...", &s[..max_len - 3])
    }
}

/// Convert to snake_case
pub fn to_snake_case(s: &str) -> String {
    let mut result = String::new();
    for (i, c) in s.chars().enumerate() {
        if c.is_uppercase() {
            if i > 0 {
                result.push('_');
            }
            result.push(c.to_lowercase().next().unwrap());
        } else {
            result.push(c);
        }
    }
    result
}

/// Convert to camelCase
pub fn to_camel_case(s: &str) -> String {
    let mut result = String::new();
    let mut capitalize_next = false;

    for c in s.chars() {
        if c == '_' || c == '-' {
            capitalize_next = true;
        } else if capitalize_next {
            result.push(c.to_uppercase().next().unwrap());
            capitalize_next = false;
        } else {
            result.push(c);
        }
    }
    result
}

/// Normalize a task name (trim, lowercase, replace spaces with underscores)
pub fn normalize_task_name(s: &str) -> String {
    s.trim().to_lowercase().replace(' ', "_")
}

/// Generate a short hash prefix from a string (for display/debugging)
pub fn short_hash(s: &str, len: usize) -> String {
    let hash = blake3::hash(s.as_bytes()).to_hex();
    hash[..len.min(64)].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_blank() {
        assert!(is_blank(""));
        assert!(is_blank("   "));
        assert!(!is_blank("hello"));
    }

    #[test]
    fn test_truncate() {
        assert_eq!(truncate("hello", 10), "hello");
        assert_eq!(truncate("hello world", 8), "hello...");
        assert_eq!(truncate("hi", 3), "...");
    }

    #[test]
    fn test_to_snake_case() {
        assert_eq!(to_snake_case("HelloWorld"), "hello_world");
        assert_eq!(to_snake_case("TaskName"), "task_name");
    }

    #[test]
    fn test_to_camel_case() {
        assert_eq!(to_camel_case("hello_world"), "helloWorld");
        assert_eq!(to_camel_case("task-name"), "taskName");
    }

    #[test]
    fn test_normalize_task_name() {
        assert_eq!(normalize_task_name("  Hello World  "), "hello_world");
        assert_eq!(normalize_task_name("Task Name"), "task_name");
    }
}
