//! Design system for TUI application
//! Defines color palette, spacing tokens, and typography rules

use ratatui::style::{Color, Modifier, Style};
use ui_theme::ThemeTokens;

fn rgb_to_color(rgb: ui_theme::Rgb) -> Color {
    Color::Rgb(rgb.r, rgb.g, rgb.b)
}

/// Color palette for the application
#[derive(Debug, Clone, Copy)]
pub struct Palette {
    /// Primary colors
    pub primary: Color,
    pub primary_variant: Color,
    pub on_primary: Color,

    /// Secondary colors
    pub secondary: Color,
    pub secondary_variant: Color,
    pub on_secondary: Color,

    /// Background colors
    pub background: Color,
    pub surface: Color,
    pub surface_variant: Color,

    /// Text colors
    pub on_background: Color,
    pub on_surface: Color,
    pub on_surface_variant: Color,

    /// Status colors
    pub error: Color,
    pub warning: Color,
    pub success: Color,
    pub info: Color,

    /// Border colors
    pub border: Color,
    pub border_focused: Color,

    /// File type colors
    pub file_directory: Color,
    pub file_code: Color,
    pub file_text: Color,
    pub file_image: Color,
    pub file_archive: Color,
}

impl Default for Palette {
    fn default() -> Self {
        Self::dark()
    }
}

impl Palette {
    /// Dark theme (default for terminal)
    pub fn dark() -> Self {
        Self::from_tokens(ThemeTokens::dark())
    }

    /// Light theme
    pub fn light() -> Self {
        Self::from_tokens(ThemeTokens::light())
    }

     pub fn from_tokens(tokens: ThemeTokens) -> Self {
         let c = tokens.colors;
         Self {
             primary: rgb_to_color(c.primary),
             primary_variant: rgb_to_color(c.primary),
             on_primary: rgb_to_color(c.primary_foreground),

             secondary: rgb_to_color(c.secondary),
             secondary_variant: rgb_to_color(c.secondary),
             on_secondary: rgb_to_color(c.secondary_foreground),

             background: rgb_to_color(c.background),
             surface: rgb_to_color(c.card),
             surface_variant: rgb_to_color(c.popover),

             on_background: rgb_to_color(c.foreground),
             on_surface: rgb_to_color(c.card_foreground),
             on_surface_variant: rgb_to_color(c.foreground),

             error: rgb_to_color(c.error),
             warning: rgb_to_color(c.warning),
             success: rgb_to_color(c.success),
             info: rgb_to_color(c.info),

             border: rgb_to_color(c.border),
             border_focused: rgb_to_color(c.ring),

             file_directory: rgb_to_color(c.file_directory),
             file_code: rgb_to_color(c.file_code),
             file_text: rgb_to_color(c.file_text),
             file_image: rgb_to_color(c.file_image),
             file_archive: rgb_to_color(c.file_archive),
         }
     }
}

/// Spacing tokens
#[derive(Debug, Clone, Copy)]
pub struct Spacing {
    pub xs: u16,
    pub sm: u16,
    pub md: u16,
    pub lg: u16,
    pub xl: u16,
}

impl Default for Spacing {
    fn default() -> Self {
        Self {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 6,
        }
    }
}

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

/// File type for color mapping
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FileType {
    Directory,
    Code,
    Text,
    Image,
    Archive,
    Other,
}

impl FileType {
    /// Determine file type from extension
    pub fn from_extension(ext: &str) -> Self {
        match ext.to_lowercase().as_str() {
            // Code files
            "rs" | "toml" | "json" | "yaml" | "yml" | "xml" | "html" | "css" | "js" | "ts"
            | "tsx" | "jsx" | "py" | "go" | "java" | "c" | "cpp" | "h" | "hpp" | "cs" | "php"
            | "rb" | "swift" | "kt" | "scala" | "sh" | "bash" | "zsh" | "fish" | "sql" => {
                FileType::Code
            }

            // Text files
            "txt" | "md" | "rst" | "adoc" | "log" => FileType::Text,

            // Image files
            "png" | "jpg" | "jpeg" | "gif" | "svg" | "webp" | "bmp" | "ico" => FileType::Image,

            // Archive files
            "zip" | "tar" | "gz" | "bz2" | "xz" | "7z" | "rar" | "tgz" => FileType::Archive,

            _ => FileType::Other,
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
