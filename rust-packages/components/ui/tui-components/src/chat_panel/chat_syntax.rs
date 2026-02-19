//! Syntax highlighting for code blocks

use crate::theme::Theme;
use ratatui::{
    style::{Color, Modifier, Style},
    text::Line,
};

pub struct SyntaxHighlighter {
    theme: Theme,
}

impl SyntaxHighlighter {
    pub fn new(theme: Theme) -> Self {
        Self { theme }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme;
    }

    /// Detect if content contains code blocks
    pub fn detect_code_block(content: &str) -> bool {
        content.contains("```") || content.contains("```rust") || content.contains("```js")
    }

    /// Highlight code with syntax highlighting
    pub fn highlight_code<'a>(&self, code: &'a str) -> Vec<Line<'a>> {
        let mut lines = Vec::new();
        let mut in_code_block = false;
        let mut code_language = String::new();

        for line in code.lines() {
            if line.starts_with("```") {
                if in_code_block {
                    in_code_block = false;
                    let _language = code_language.clone();
                    code_language.clear();
                    lines.push(Line::from(ratatui::text::Span::styled(
                        "```",
                        Style::default().fg(self.theme.palette.secondary),
                    )));
                } else {
                    in_code_block = true;
                    code_language = line.trim_start_matches("```").trim().to_string();
                    lines.push(Line::from(ratatui::text::Span::styled(
                        line,
                        Style::default().fg(self.theme.palette.secondary),
                    )));
                }
            } else if in_code_block {
                let language = code_language.clone();
                lines.push(Self::highlight_code_line(line, language, &self.theme));
            } else {
                lines.push(Line::from(ratatui::text::Span::raw(line)));
            }
        }

        lines
    }

    /// Highlight a single line of code
    fn highlight_code_line(line: &str, _language: String, _theme: &Theme) -> Line<'static> {
        // Simple syntax highlighting - just return the line as is for now
        // Note: Implement proper syntax highlighting would require:
        // - Using a syntax highlighting library (syntect, tree-sitter, etc.)
        // - Supporting multiple programming languages
        // - Providing theme-aware coloring
        // For now, this is a placeholder that would be replaced with actual syntax highlighting
        Line::from(ratatui::text::Span::raw(line.to_string()))
    }
}
