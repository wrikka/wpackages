//! Typography styles for the application

use ratatui::style::{Color, Modifier, Style};

/// Typography styles
#[derive(Debug, Clone, Copy)]
pub struct Typography {
    pub normal: Style,
    pub bold: Style,
    pub italic: Style,
    pub dim: Style,
    pub underlined: Style,
}

impl Default for Typography {
    fn default() -> Self {
        Self {
            normal: Style::default(),
            bold: Style::default().add_modifier(Modifier::BOLD),
            italic: Style::default().add_modifier(Modifier::ITALIC),
            dim: Style::default().add_modifier(Modifier::DIM),
            underlined: Style::default().add_modifier(Modifier::UNDERLINED),
        }
    }
}

impl Typography {
    /// Create typography with custom foreground color
    pub fn with_fg(fg: Color) -> Self {
        Self {
            normal: Style::default().fg(fg),
            bold: Style::default().fg(fg).add_modifier(Modifier::BOLD),
            italic: Style::default().fg(fg).add_modifier(Modifier::ITALIC),
            dim: Style::default().fg(fg).add_modifier(Modifier::DIM),
            underlined: Style::default().fg(fg).add_modifier(Modifier::UNDERLINED),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_typography() {
        let typography = Typography::default();
        assert!(typography.bold.modifiers.contains(Modifier::BOLD));
    }

    #[test]
    fn test_typography_with_fg() {
        let typography = Typography::with_fg(Color::Red);
        assert_eq!(typography.normal.fg.unwrap(), Color::Red);
    }
}
