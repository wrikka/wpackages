//! Text context for styling

use super::palette::Palette;
use ratatui::style::Style;

/// Context for text styling
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TextContext {
    Primary,
    Secondary,
    Accent,
    Error,
    Warning,
    Success,
    Info,
}

impl TextContext {
    /// Get style for this context from palette
    pub fn get_style(self, palette: &Palette) -> Style {
        match self {
            TextContext::Primary => Style::default().fg(palette.on_background),
            TextContext::Secondary => Style::default().fg(palette.on_surface_variant),
            TextContext::Accent => Style::default().fg(palette.primary),
            TextContext::Error => Style::default().fg(palette.error),
            TextContext::Warning => Style::default().fg(palette.warning),
            TextContext::Success => Style::default().fg(palette.success),
            TextContext::Info => Style::default().fg(palette.info),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_context_style() {
        let palette = Palette::default();
        let error_style = TextContext::Error.get_style(&palette);
        assert_eq!(error_style.fg.unwrap(), palette.error);
    }
}
