//! Color palette for the application

use ratatui::style::Color;

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
        Self {
            // Primary colors - Blue
            primary: Color::Rgb(66, 165, 245),
            primary_variant: Color::Rgb(30, 136, 229),
            on_primary: Color::Rgb(0, 0, 0),

            // Secondary colors - Purple
            secondary: Color::Rgb(171, 145, 242),
            secondary_variant: Color::Rgb(142, 110, 229),
            on_secondary: Color::Rgb(0, 0, 0),

            // Background colors
            background: Color::Rgb(18, 18, 18),
            surface: Color::Rgb(24, 24, 24),
            surface_variant: Color::Rgb(32, 32, 32),

            // Text colors
            on_background: Color::Rgb(224, 224, 224),
            on_surface: Color::Rgb(224, 224, 224),
            on_surface_variant: Color::Rgb(148, 148, 148),

            // Status colors
            error: Color::Rgb(239, 83, 80),
            warning: Color::Rgb(255, 202, 40),
            success: Color::Rgb(102, 187, 106),
            info: Color::Rgb(66, 165, 245),

            // Border colors
            border: Color::Rgb(60, 60, 60),
            border_focused: Color::Rgb(66, 165, 245),

            // File type colors
            file_directory: Color::Rgb(121, 85, 72),
            file_code: Color::Rgb(102, 187, 106),
            file_text: Color::Rgb(224, 224, 224),
            file_image: Color::Rgb(255, 167, 38),
            file_archive: Color::Rgb(255, 238, 88),
        }
    }

    /// Light theme
    pub fn light() -> Self {
        Self {
            primary: Color::Rgb(25, 118, 210),
            primary_variant: Color::Rgb(21, 101, 192),
            on_primary: Color::Rgb(255, 255, 255),

            secondary: Color::Rgb(156, 39, 176),
            secondary_variant: Color::Rgb(123, 31, 162),
            on_secondary: Color::Rgb(255, 255, 255),

            background: Color::Rgb(250, 250, 250),
            surface: Color::Rgb(255, 255, 255),
            surface_variant: Color::Rgb(245, 245, 245),

            on_background: Color::Rgb(33, 33, 33),
            on_surface: Color::Rgb(33, 33, 33),
            on_surface_variant: Color::Rgb(97, 97, 97),

            error: Color::Rgb(211, 47, 47),
            warning: Color::Rgb(245, 124, 0),
            success: Color::Rgb(67, 160, 71),
            info: Color::Rgb(25, 118, 210),

            border: Color::Rgb(200, 200, 200),
            border_focused: Color::Rgb(25, 118, 210),

            file_directory: Color::Rgb(141, 110, 99),
            file_code: Color::Rgb(67, 160, 71),
            file_text: Color::Rgb(33, 33, 33),
            file_image: Color::Rgb(245, 124, 0),
            file_archive: Color::Rgb(251, 192, 45),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_palette() {
        let palette = Palette::default();
        assert_eq!(palette.primary, Color::Rgb(66, 165, 245));
    }

    #[test]
    fn test_dark_palette() {
        let palette = Palette::dark();
        assert_eq!(palette.background, Color::Rgb(18, 18, 18));
    }

    #[test]
    fn test_light_palette() {
        let palette = Palette::light();
        assert_eq!(palette.background, Color::Rgb(250, 250, 250));
    }
}
