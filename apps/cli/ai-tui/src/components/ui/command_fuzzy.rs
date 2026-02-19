//! Fuzzy matching for command palette

pub use super::command_types::FuzzyMatch;

impl FuzzyMatch {
    /// Perform fuzzy match between query and text
    pub fn fuzzy_match(query: &str, text: &str) -> Option<FuzzyMatch> {
        if query.is_empty() {
            return Some(FuzzyMatch::new(1.0, Vec::new()));
        }

        let query_lower = query.to_lowercase();
        let text_lower = text.to_lowercase();
        let mut score = 0.0;
        let mut indices = Vec::new();
        let mut query_idx = 0;
        let mut consecutive = 0;

        for (i, c) in text_lower.chars().enumerate() {
            if query_idx < query_lower.len() {
                let query_char = query_lower.chars().nth(query_idx).unwrap();
                if c == query_char {
                    indices.push(i);
                    consecutive += 1;
                    score += 1.0 + (consecutive as f64 * 0.5);
                    query_idx += 1;
                } else {
                    consecutive = 0;
                }
            }
        }

        if query_idx == query_lower.len() {
            let length_penalty = text.len() as f64 / query.len() as f64;
            score = score / length_penalty;
            Some(FuzzyMatch::new(score, indices))
        } else {
            None
        }
    }

    /// Highlight matched characters in text
    pub fn highlight_match<'a>(
        &self,
        text: &'a str,
        theme: &crate::components::ui::Theme,
    ) -> ratatui::text::Line<'a> {
        use ratatui::{
            style::{Modifier, Style},
            text::{Line, Span},
        };

        if self.indices.is_empty() {
            return Line::from(Span::raw(text));
        }

        let mut spans = Vec::new();
        let mut last_idx = 0;

        for &idx in self.indices.iter() {
            if idx > last_idx {
                spans.push(Span::raw(&text[last_idx..idx]));
            }
            if idx < text.len() {
                spans.push(Span::styled(
                    &text[idx..=idx],
                    Style::default()
                        .fg(theme.palette.primary)
                        .add_modifier(Modifier::BOLD),
                ));
                last_idx = idx + 1;
            }
        }

        if last_idx < text.len() {
            spans.push(Span::raw(&text[last_idx..]));
        }

        Line::from(spans)
    }
}
