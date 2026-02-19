//! String utility functions
//!
//! Pure functions for string manipulation.

/// Truncate text to a maximum length
pub fn truncate(text: &str, max_len: usize) -> String {
    if text.len() <= max_len {
        text.to_string()
    } else {
        format!("{}...", &text[..max_len.saturating_sub(3)])
    }
}

/// Clean whitespace from text
pub fn clean_whitespace(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// Escape special characters for JSON
pub fn escape_json(text: &str) -> String {
    text.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

/// Check if string contains only ASCII characters
pub fn is_ascii_only(text: &str) -> bool {
    text.is_ascii()
}
