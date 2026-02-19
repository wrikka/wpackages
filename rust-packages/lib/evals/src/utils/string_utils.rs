//! Pure string utility functions

/// Normalize text for comparison
pub fn normalize_text(text: &str) -> String {
    text.trim()
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Check if two strings are similar after normalization
pub fn is_similar(text1: &str, text2: &str, threshold: f64) -> bool {
    let normalized1 = normalize_text(text1);
    let normalized2 = normalize_text(text2);
    
    if normalized1.is_empty() && normalized2.is_empty() {
        return true;
    }
    
    let similarity = jaccard_similarity(&normalized1, &normalized2);
    similarity >= threshold
}

/// Calculate Jaccard similarity between two strings
pub fn jaccard_similarity(text1: &str, text2: &str) -> f64 {
    let words1: std::collections::HashSet<&str> = text1.split_whitespace().collect();
    let words2: std::collections::HashSet<&str> = text2.split_whitespace().collect();
    
    if words1.is_empty() && words2.is_empty() {
        return 1.0;
    }
    
    let intersection = words1.intersection(&words2).count();
    let union = words1.union(&words2).count();
    
    intersection as f64 / union as f64
}

/// Extract keywords from text
pub fn extract_keywords(text: &str, min_length: usize) -> Vec<String> {
    text.to_lowercase()
        .split_whitespace()
        .filter(|word| word.len() >= min_length && word.chars().all(|c| c.is_alphabetic()))
        .map(|word| word.trim_matches(|c: char| !c.is_alphanumeric()).to_string())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect()
}

/// Truncate text to specified length with ellipsis
pub fn truncate_text(text: &str, max_length: usize) -> String {
    if text.len() <= max_length {
        text.to_string()
    } else {
        format!("{}...", &text[..max_length.saturating_sub(3)])
    }
}

/// Count words in text
pub fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

/// Count characters (excluding whitespace)
pub fn count_chars(text: &str) -> usize {
    text.chars().filter(|c| !c.is_whitespace()).count()
}

/// Validate text is not empty or just whitespace
pub fn is_valid_text(text: &str) -> bool {
    !text.trim().is_empty()
}

/// Sanitize text for logging
pub fn sanitize_for_logging(text: &str) -> String {
    text.chars()
        .map(|c| match c {
            '\n' => ' ',
            '\r' => ' ',
            '\t' => ' ',
            _ if c.is_control() => ' ',
            _ => c,
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_text() {
        assert_eq!(normalize_text("  Hello, WORLD!  "), "hello world");
        assert_eq!(normalize_text("Test123!!!"), "test123");
        assert_eq!(normalize_text(""), "");
    }

    #[test]
    fn test_is_similar() {
        assert!(is_similar("Hello World", "hello world!", 0.8));
        assert!(is_similar("", "", 0.5));
        assert!(!is_similar("Hello", "World", 0.5));
    }

    #[test]
    fn test_jaccard_similarity() {
        assert_eq!(jaccard_similarity("", ""), 1.0);
        assert_eq!(jaccard_similarity("hello world", "hello"), 0.5);
        assert_eq!(jaccard_similarity("a b c", "a b c"), 1.0);
    }

    #[test]
    fn test_extract_keywords() {
        let keywords = extract_keywords("Hello world, this is a test!", 3);
        assert!(keywords.contains(&"hello".to_string()));
        assert!(keywords.contains(&"world".to_string()));
        assert!(keywords.contains(&"this".to_string()));
        assert!(!keywords.contains(&"is".to_string()));
        assert!(!keywords.contains(&"a".to_string()));
    }

    #[test]
    fn test_truncate_text() {
        assert_eq!(truncate_text("Hello", 10), "Hello");
        assert_eq!(truncate_text("Hello World", 8), "Hello...");
        assert_eq!(truncate_text("", 5), "");
    }

    #[test]
    fn test_count_words() {
        assert_eq!(count_words("Hello world"), 2);
        assert_eq!(count_words("  Hello   world  "), 2);
        assert_eq!(count_words(""), 0);
    }

    #[test]
    fn test_count_chars() {
        assert_eq!(count_chars("Hello world"), 10);
        assert_eq!(count_chars("  Hello   world  "), 10);
        assert_eq!(count_chars(""), 0);
    }

    #[test]
    fn test_is_valid_text() {
        assert!(is_valid_text("Hello"));
        assert!(is_valid_text("  Hello  "));
        assert!(!is_valid_text(""));
        assert!(!is_valid_text("   "));
    }

    #[test]
    fn test_sanitize_for_logging() {
        assert_eq!(sanitize_for_logging("Hello\nWorld"), "Hello World");
        assert_eq!(sanitize_for_logging("Test\tTab"), "Test Tab");
        assert_eq!(sanitize_for_logging("Hello\x00World"), "Hello World");
    }
}
