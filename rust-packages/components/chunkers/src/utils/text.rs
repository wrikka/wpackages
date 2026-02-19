//! Text processing utilities

/// Count tokens (word-based estimation)
pub fn estimate_token_count(text: &str) -> usize {
    text.split_whitespace().count()
}

/// Count characters
pub fn count_chars(text: &str) -> usize {
    text.chars().count()
}

/// Clean and normalize text
pub fn clean_text(text: &str) -> String {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Split text into sentences
pub fn split_sentences(text: &str) -> Vec<String> {
    let mut sentences = Vec::new();
    let mut current = String::new();

    for char in text.chars() {
        current.push(char);
        if char == '.' || char == '!' || char == '?' {
            let trimmed = current.trim();
            if !trimmed.is_empty() {
                sentences.push(trimmed.to_string());
            }
            current.clear();
        }
    }

    if !current.trim().is_empty() {
        sentences.push(current.trim().to_string());
    }

    sentences
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_estimate_token_count() {
        let text = "Hello world this is a test";
        assert_eq!(estimate_token_count(text), 6);
    }

    #[test]
    fn test_split_sentences() {
        let text = "Hello world. How are you? I'm fine.";
        let sentences = split_sentences(text);
        assert_eq!(sentences.len(), 3);
    }
}
