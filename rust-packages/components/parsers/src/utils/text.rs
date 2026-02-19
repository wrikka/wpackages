//! Text processing utilities

/// Clean and normalize text
pub fn clean_text(text: &str) -> String {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Count words in text
pub fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

/// Count characters in text
pub fn count_chars(text: &str) -> usize {
    text.chars().count()
}

/// Truncate text to specified length
pub fn truncate_text(text: &str, max_length: usize) -> String {
    if text.len() <= max_length {
        return text.to_string();
    }

    let truncated: String = text.chars().take(max_length).collect();
    format!("{}...", truncated)
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
    fn test_count_words() {
        let text = "Hello world this is a test";
        assert_eq!(count_words(text), 6);
    }

    #[test]
    fn test_truncate_text() {
        let text = "Hello world";
        let truncated = truncate_text(text, 5);
        assert_eq!(truncated, "Hello...");
    }
}
