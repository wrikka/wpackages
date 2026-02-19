pub mod builtin;
pub mod types;

pub use types::{SyntaxHighlightTheme, Theme, ThemeColor, UiTheme};

use crate::error::Result;
use crate::services::tree_sitter::SyntaxHighlight;
use ratatui::{
    style::Style,
    text::{Span, Text},
};

pub struct ThemeService {
    themes: Vec<Theme>,
    current_theme: String,
}

impl ThemeService {
    pub fn new() -> Self {
        Self {
            themes: builtin::all_themes(),
            current_theme: "dark".to_string(),
        }
    }

    pub fn set_theme(&mut self, name: &str) -> Result<()> {
        if self.themes.iter().any(|t| t.name == name) {
            self.current_theme = name.to_string();
            Ok(())
        } else {
            Err(crate::error::AppError::Render(format!(
                "Theme not found: {}",
                name
            )))
        }
    }

    pub fn get_theme(&self) -> &Theme {
        self.themes
            .iter()
            .find(|t| t.name == self.current_theme)
            .unwrap_or(&self.themes[0])
    }

    pub fn get_themes(&self) -> Vec<String> {
        self.themes.iter().map(|t| t.name.clone()).collect()
    }

    pub fn get_syntax_highlight_style(&self, highlight: SyntaxHighlight) -> Style {
        let theme = self.get_theme();
        let color = match highlight {
            SyntaxHighlight::Normal => theme.foreground.to_color(),
            SyntaxHighlight::Keyword => theme.syntax_highlight.keyword.to_color(),
            SyntaxHighlight::String => theme.syntax_highlight.string.to_color(),
            SyntaxHighlight::Function => theme.syntax_highlight.function.to_color(),
            SyntaxHighlight::Variable => theme.syntax_highlight.variable.to_color(),
            SyntaxHighlight::Comment => theme.syntax_highlight.comment.to_color(),
            SyntaxHighlight::Type => theme.syntax_highlight.type_color.to_color(),
            SyntaxHighlight::Number => theme.syntax_highlight.number.to_color(),
            SyntaxHighlight::Operator => theme.syntax_highlight.operator.to_color(),
            SyntaxHighlight::Punctuation => theme.syntax_highlight.punctuation.to_color(),
            SyntaxHighlight::Constant => theme.syntax_highlight.constant.to_color(),
            SyntaxHighlight::Attribute => theme.syntax_highlight.attribute.to_color(),
            SyntaxHighlight::Tag => theme.syntax_highlight.tag.to_color(),
            SyntaxHighlight::Special => theme.syntax_highlight.special.to_color(),
        };

        Style::default().fg(color)
    }

    pub fn apply_syntax_highlight<'a>(
        &self,
        text: &'a str,
        highlights: &[(usize, usize, SyntaxHighlight)],
    ) -> Text<'a> {
        let mut spans = Vec::new();
        let mut last_end: usize = 0;

        for (start, end, highlight) in highlights {
            if *start > last_end {
                spans.push(Span::styled(
                    &text[last_end..*start],
                    self.get_syntax_highlight_style(SyntaxHighlight::Normal),
                ));
            }

            if *start < *end {
                spans.push(Span::styled(
                    &text[*start..*end],
                    self.get_syntax_highlight_style(*highlight),
                ));
            }

            last_end = (*end).max(last_end);
        }

        if last_end < text.len() {
            spans.push(Span::styled(
                &text[last_end..],
                self.get_syntax_highlight_style(SyntaxHighlight::Normal),
            ));
        }

        Text::from_iter(spans)
    }
}

impl Default for ThemeService {
    fn default() -> Self {
        Self::new()
    }
}
