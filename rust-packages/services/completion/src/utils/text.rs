//! Text processing utilities

/// Count tokens (simple word-based estimation)
pub fn estimate_token_count(text: &str) -> usize {
    text.split_whitespace().count()
}

/// Truncate text to fit within token limit
pub fn truncate_to_token_limit(text: &str, max_tokens: usize) -> String {
    let words: Vec<&str> = text.split_whitespace().collect();
    if words.len() <= max_tokens {
        return text.to_string();
    }

    words
        .iter()
        .take(max_tokens)
        .cloned()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Clean and normalize text
pub fn clean_text(text: &str) -> String {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Extract code blocks from markdown
pub fn extract_code_blocks(text: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut in_code_block = false;
    let mut current_block = String::new();

    for line in text.lines() {
        if line.starts_with("```") {
            if in_code_block {
                blocks.push(current_block.trim().to_string());
                current_block.clear();
            }
            in_code_block = !in_code_block;
        } else if in_code_block {
            current_block.push_str(line);
            current_block.push('\n');
        }
    }

    blocks
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
    fn test_truncate_to_token_limit() {
        let text = "one two three four five six";
        let truncated = truncate_to_token_limit(text, 3);
        assert_eq!(truncated, "one two three");
    }

    #[test]
    fn test_extract_code_blocks() {
        let text = "```rust\nfn main() {}\n```\nSome text\n```python\ndef test():\n    pass\n```";
        let blocks = extract_code_blocks(text);
        assert_eq!(blocks.len(), 2);
        assert!(blocks[0].contains("fn main"));
        assert!(blocks[1].contains("def test"));
    }
}
