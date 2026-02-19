//! Text processing utilities

/// Clean and normalize text
pub fn clean_text(text: &str) -> String {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Truncate text to maximum length
pub fn truncate_text(text: &str, max_length: usize) -> String {
    if text.len() <= max_length {
        text.to_string()
    } else {
        text.chars().take(max_length).collect()
    }
}

/// Estimate token count (simple word-based estimation)
pub fn estimate_token_count(text: &str) -> usize {
    text.split_whitespace().count()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_text() {
        let text = "  Line 1  \n\n  Line 2  \n  Line 3  ";
        let cleaned = clean_text(text);
        assert_eq!(cleaned, "Line 1\nLine 2\nLine 3");
    }

    #[test]
    fn test_truncate_text() {
        let text = "Hello world this is a test";
        let truncated = truncate_text(text, 10);
        assert_eq!(truncated.len(), 10);
    }

    #[test]
    fn test_estimate_token_count() {
        let text = "Hello world this is a test";
        let count = estimate_token_count(text);
        assert_eq!(count, 6);
    }
}
