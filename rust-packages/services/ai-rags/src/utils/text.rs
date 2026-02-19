//! Text processing utilities

/// Clean and normalize text
pub fn clean_text(text: &str) -> String {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Split text into sentences (simple implementation)
pub fn split_sentences(text: &str) -> Vec<String> {
    text.split(|c: char| c == '.' || c == '!' || c == '?')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

/// Count tokens (simple word-based estimation)
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
    fn test_split_sentences() {
        let text = "Hello world. How are you? I'm fine!";
        let sentences = split_sentences(text);
        assert_eq!(sentences.len(), 3);
    }

    #[test]
    fn test_estimate_token_count() {
        let text = "Hello world this is a test";
        let count = estimate_token_count(text);
        assert_eq!(count, 6);
    }
}
