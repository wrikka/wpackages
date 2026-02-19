use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionContext {
    pub line: String,
    pub column: usize,
    pub file_path: Option<String>,
    pub language: Option<String>,
    pub surrounding_lines: Vec<String>,
}

pub struct ContextExtractor {
    max_surrounding_lines: usize,
}

impl ContextExtractor {
    pub fn new(max_surrounding_lines: usize) -> Self {
        Self {
            max_surrounding_lines,
        }
    }

    pub fn extract_context(&self, line: &str, column: usize) -> CompletionContext {
        let surrounding_lines = Vec::new();

        CompletionContext {
            line: line.to_string(),
            column,
            file_path: None,
            language: None,
            surrounding_lines,
        }
    }

    pub fn extract_word_at_cursor(&self, line: &str, column: usize) -> String {
        let chars: Vec<char> = line.chars().collect();
        let mut start = column;
        let mut end = column;

        while start > 0 && chars[start - 1].is_alphanumeric() || chars[start - 1] == '_' {
            start -= 1;
        }

        while end < chars.len() && chars[end].is_alphanumeric() || chars[end] == '_' {
            end += 1;
        }

        chars[start..end].iter().collect()
    }
}
