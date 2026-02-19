//! Design system for TUI application
//! Defines color palette, spacing tokens, and typography rules

mod file_type;
mod palette;
mod spacing;
mod text_context;
mod typography;

pub use file_type::FileType;
pub use palette::Palette;
pub use spacing::Spacing;
pub use text_context::TextContext;
pub use typography::Typography;

use ratatui::style::{Color, Modifier, Style};

/// Theme combining all design tokens
#[derive(Debug, Clone)]
pub struct Theme {
    pub palette: Palette,
    pub spacing: Spacing,
    pub typography: Typography,
}

impl Default for Theme {
    fn default() -> Self {
        Self::dark()
    }
}

impl Theme {
    /// Create dark theme
    pub fn dark() -> Self {
        Self {
            palette: Palette::dark(),
            spacing: Spacing::default(),
            typography: Typography::default(),
        }
    }

    /// Create light theme
    pub fn light() -> Self {
        Self {
            palette: Palette::light(),
            spacing: Spacing::default(),
            typography: Typography::default(),
        }
    }

    /// Get style for focused element
    pub fn focused(&self) -> Style {
        Style::default()
            .fg(self.palette.primary)
            .add_modifier(Modifier::BOLD)
    }

    /// Get style for selected element
    pub fn selected(&self) -> Style {
        Style::default()
            .bg(self.palette.primary_variant)
            .fg(self.palette.on_primary)
    }

    /// Get style for borders
    pub fn border(&self, focused: bool) -> Style {
        if focused {
            Style::default().fg(self.palette.border_focused)
        } else {
            Style::default().fg(self.palette.border)
        }
    }

    /// Get style for text based on context
    pub fn text(&self, context: TextContext) -> Style {
        match context {
            TextContext::Primary => Style::default().fg(self.palette.on_background),
            TextContext::Secondary => Style::default().fg(self.palette.on_surface_variant),
            TextContext::Accent => Style::default().fg(self.palette.primary),
            TextContext::Error => Style::default().fg(self.palette.error),
            TextContext::Warning => Style::default().fg(self.palette.warning),
            TextContext::Success => Style::default().fg(self.palette.success),
            TextContext::Info => Style::default().fg(self.palette.info),
        }
    }

    /// Get color based on file type
    pub fn file_color(&self, file_type: FileType) -> Color {
        match file_type {
            FileType::Directory => self.palette.file_directory,
            FileType::Code => self.palette.file_code,
            FileType::Text => self.palette.file_text,
            FileType::Image => self.palette.file_image,
            FileType::Archive => self.palette.file_archive,
            FileType::Other => self.palette.on_surface_variant,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_theme() {
        let theme = Theme::default();
        assert_eq!(theme.palette.primary, Color::Rgb(66, 165, 245));
    }

    #[test]
    fn test_dark_theme() {
        let theme = Theme::dark();
        assert_eq!(theme.palette.background, Color::Rgb(18, 18, 18));
    }

    #[test]
    fn test_light_theme() {
        let theme = Theme::light();
        assert_eq!(theme.palette.background, Color::Rgb(250, 250, 250));
    }

    #[test]
    fn test_file_type_detection() {
        assert_eq!(FileType::from_extension("rs"), FileType::Code);
        assert_eq!(FileType::from_extension("txt"), FileType::Text);
        assert_eq!(FileType::from_extension("png"), FileType::Image);
        assert_eq!(FileType::from_extension("zip"), FileType::Archive);
        assert_eq!(FileType::from_extension("unknown"), FileType::Other);
    }

    #[test]
    fn test_text_context_styles() {
        let theme = Theme::dark();
        let error_style = theme.text(TextContext::Error);
        assert_eq!(error_style.fg.unwrap(), theme.palette.error);
    }
}
