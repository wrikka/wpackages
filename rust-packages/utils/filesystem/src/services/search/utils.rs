//! Shared utilities for search operations

/// Check if a position is at a word boundary in text
///
/// Returns true if the position is NOT surrounded by word characters
/// (alphanumeric or underscore)
pub fn is_word_boundary(text: &str, start: usize, end: usize) -> bool {
    let prev_char = if start > 0 && start - 1 < text.len() {
        text.chars().nth(start - 1)
    } else {
        None
    };
    let next_char = if end < text.len() {
        text.chars().nth(end)
    } else {
        None
    };

    let prev_is_word = prev_char.is_some_and(|c| c.is_alphanumeric() || c == '_');
    let next_is_word = next_char.is_some_and(|c| c.is_alphanumeric() || c == '_');

    !prev_is_word && !next_is_word
}

/// Normalize text and pattern for case-insensitive matching
///
/// Returns a tuple of (normalized_text, normalized_pattern)
pub fn normalize_case(text: &str, pattern: &str, case_sensitive: bool) -> (String, String) {
    if case_sensitive {
        (text.to_string(), pattern.to_string())
    } else {
        (text.to_lowercase(), pattern.to_lowercase())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_word_boundary_whole_word() {
        let text = "test tester testing";
        assert!(is_word_boundary(text, 0, 4)); // "test" at start
        assert!(!is_word_boundary(text, 5, 11)); // "tester" has "est" prefix
        assert!(!is_word_boundary(text, 12, 19)); // "testing" has "test" prefix
    }

    #[test]
    fn test_word_boundary_with_underscore() {
        let text = "test_var test";
        assert!(!is_word_boundary(text, 0, 4)); // "test" before "_"
        assert!(is_word_boundary(text, 9, 13)); // "test" at end
    }

    #[test]
    fn test_normalize_case_sensitive() {
        let text = "Test String";
        let pattern = "Test";
        let (norm_text, norm_pattern) = normalize_case(text, pattern, true);
        assert_eq!(norm_text, "Test String");
        assert_eq!(norm_pattern, "Test");
    }

    #[test]
    fn test_normalize_case_insensitive() {
        let text = "Test String";
        let pattern = "test";
        let (norm_text, norm_pattern) = normalize_case(text, pattern, false);
        assert_eq!(norm_text, "test string");
        assert_eq!(norm_pattern, "test");
    }
}
