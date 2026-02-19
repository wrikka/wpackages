//! Syntax highlighting for code blocks

use crate::components::ui::Theme;
use ratatui::{
    style::{Modifier, Style},
    text::{Line, Span},
};

#[derive(Debug, Clone)]
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
    pub fn highlight_code(&self, code: &str) -> Vec<Line<'static>> {
        let mut lines: Vec<Line<'static>> = Vec::new();
        let mut in_code_block = false;
        let mut code_language = String::new();

        for line in code.lines() {
            if line.starts_with("```") {
                if in_code_block {
                    in_code_block = false;
                    code_language.clear();
                    lines.push(Line::from(ratatui::text::Span::styled(
                        "```",
                        Style::default().fg(self.theme.palette.secondary),
                    )));
                } else {
                    in_code_block = true;
                    code_language = line.trim_start_matches("```").trim().to_string();
                    lines.push(Line::from(ratatui::text::Span::styled(
                        line.to_string(),
                        Style::default().fg(self.theme.palette.secondary),
                    )));
                }
            } else if in_code_block {
                lines.push(Self::highlight_code_line(line, &code_language, &self.theme));
            } else {
                lines.push(Line::from(ratatui::text::Span::raw(line.to_string())));
            }
        }

        lines
    }

    /// Highlight a single line of code
    fn highlight_code_line(line: &str, language: &str, theme: &Theme) -> Line<'static> {
        let mut spans: Vec<Span<'static>> = Vec::new();

        // Simple syntax highlighting for common patterns
        let keywords = if language == "rust" {
            vec![
                "fn", "let", "mut", "pub", "struct", "impl", "enum", "match", "if", "else", "for",
                "while", "loop", "return", "use", "mod", "trait", "type", "const", "static",
            ]
        } else if language == "js" || language == "ts" {
            vec![
                "const", "let", "var", "function", "return", "if", "else", "for", "while", "class",
                "extends", "import", "export", "default", "async", "await", "try", "catch",
            ]
        } else {
            vec![]
        };

        // Find and highlight keywords
        let mut remaining = line;
        while !remaining.is_empty() {
            let mut found_keyword = false;

            for keyword in &keywords {
                if remaining.starts_with(keyword) {
                    let keyword_end = keyword.len();
                    if let Some(next_char) = remaining.chars().nth(keyword_end) {
                        if !next_char.is_alphanumeric() && next_char != '_' {
                            spans.push(Span::styled(
                                remaining[..keyword_end].to_string(),
                                Style::default()
                                    .fg(theme.palette.primary)
                                    .add_modifier(Modifier::BOLD),
                            ));
                            remaining = &remaining[keyword_end..];
                            found_keyword = true;
                            break;
                        }
                    }
                }
            }

            if !found_keyword {
                // Highlight strings
                if remaining.starts_with('"') {
                    if let Some(end) = remaining[1..].find('"') {
                        let string_end = end + 2;
                        spans.push(Span::styled(
                            remaining[..string_end].to_string(),
                            Style::default().fg(theme.palette.success),
                        ));
                        remaining = &remaining[string_end..];
                        continue;
                    }
                }

                // Highlight comments
                if remaining.starts_with("//") {
                    spans.push(Span::styled(
                        remaining.to_string(),
                        Style::default()
                            .fg(theme.palette.on_surface_variant)
                            .add_modifier(Modifier::ITALIC),
                    ));
                    break;
                }

                // Highlight numbers
                if remaining
                    .chars()
                    .next()
                    .map(|c| c.is_ascii_digit())
                    .unwrap_or(false)
                {
                    let num_end = remaining
                        .chars()
                        .take_while(|c| c.is_ascii_digit() || *c == '.')
                        .count();
                    spans.push(Span::styled(
                        remaining[..num_end].to_string(),
                        Style::default().fg(theme.palette.warning),
                    ));
                    remaining = &remaining[num_end..];
                    continue;
                }

                // Regular text
                let next_special = remaining
                    .chars()
                    .position(|c| {
                        c.is_ascii_whitespace()
                            || c == '"'
                            || c == '\''
                            || c == '('
                            || c == ')'
                            || c == '{'
                            || c == '}'
                            || c == '['
                            || c == ']'
                            || c == ';'
                            || c == ','
                    })
                    .unwrap_or(remaining.len());

                if next_special > 0 {
                    spans.push(Span::styled(
                        remaining[..next_special].to_string(),
                        Style::default().fg(theme.palette.on_surface),
                    ));
                    remaining = &remaining[next_special..];
                } else {
                    spans.push(Span::styled(
                        remaining[..1].to_string(),
                        Style::default().fg(theme.palette.on_surface),
                    ));
                    remaining = &remaining[1..];
                }
            }
        }

        Line::from(spans)
    }
}
