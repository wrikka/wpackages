//! Code Summarization

use crate::error::Result;

pub struct CodeSummarizer;

impl CodeSummarizer {
    pub fn summarize_file(&self, content: &str) -> Result<String> {
        let lines: Vec<&str> = content.lines().collect();
        let summary = format!(
            "File contains {} lines. Top functions:\n{}",
            lines.len(),
            self.extract_functions(content)
        );
        Ok(summary)
    }

    fn extract_functions(&self, content: &str) -> String {
        content
            .lines()
            .filter(|line| line.trim().starts_with("fn ") || line.trim().starts_with("pub fn "))
            .take(5)
            .collect::<Vec<_>>()
            .join("\n")
    }
}
