//! Theme types for UI theming

use serde::{Deserialize, Serialize};

/// Theme for the UI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    /// Unique identifier for this theme
    pub id: String,

    /// Display name
    pub name: String,

    /// Theme type
    pub theme_type: ThemeType,

    /// Color definitions
    pub colors: ThemeColors,

    /// Token colors for syntax highlighting
    pub token_colors: Vec<TokenColor>,

    /// UI colors
    pub ui_colors: UiColors,
}

impl Theme {
    /// Creates a new theme
    pub fn new(id: impl Into<String>, name: impl Into<String>, theme_type: ThemeType) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            theme_type,
            colors: ThemeColors::default(),
            token_colors: Vec::new(),
            ui_colors: UiColors::default(),
        }
    }

    /// Sets the colors
    pub fn with_colors(mut self, colors: ThemeColors) -> Self {
        self.colors = colors;
        self
    }

    /// Adds a token color
    pub fn with_token_color(mut self, token_color: TokenColor) -> Self {
        self.token_colors.push(token_color);
        self
    }

    /// Sets the UI colors
    pub fn with_ui_colors(mut self, ui_colors: UiColors) -> Self {
        self.ui_colors = ui_colors;
        self
    }
}

/// Theme type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ThemeType {
    Light,
    Dark,
    HighContrast,
}

/// Theme color definitions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeColors {
    /// Background color
    pub background: String,

    /// Foreground color
    pub foreground: String,

    /// Accent color
    pub accent: String,

    /// Border color
    pub border: String,

    /// Secondary background
    pub secondary_background: String,

    /// Secondary foreground
    pub secondary_foreground: String,

    /// Disabled background
    pub disabled_background: String,

    /// Disabled foreground
    pub disabled_foreground: String,

    /// Error color
    pub error: String,

    /// Warning color
    pub warning: String,

    /// Success color
    pub success: String,

    /// Info color
    pub info: String,
}

impl Default for ThemeColors {
    fn default() -> Self {
        Self {
            background: "#ffffff".to_string(),
            foreground: "#000000".to_string(),
            accent: "#007acc".to_string(),
            border: "#e0e0e0".to_string(),
            secondary_background: "#f5f5f5".to_string(),
            secondary_foreground: "#333333".to_string(),
            disabled_background: "#f0f0f0".to_string(),
            disabled_foreground: "#999999".to_string(),
            error: "#f44336".to_string(),
            warning: "#ff9800".to_string(),
            success: "#4caf50".to_string(),
            info: "#2196f3".to_string(),
        }
    }
}

impl ThemeColors {
    /// Creates a dark theme
    pub fn dark() -> Self {
        Self {
            background: "#1e1e1e".to_string(),
            foreground: "#d4d4d4".to_string(),
            accent: "#007acc".to_string(),
            border: "#404040".to_string(),
            secondary_background: "#2d2d2d".to_string(),
            secondary_foreground: "#cccccc".to_string(),
            disabled_background: "#333333".to_string(),
            disabled_foreground: "#666666".to_string(),
            error: "#f14c4c".to_string(),
            warning: "#cca700".to_string(),
            success: "#73c991".to_string(),
            info: "#75beff".to_string(),
        }
    }
}

/// Token color for syntax highlighting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenColor {
    /// Token scope (e.g., "keyword", "string", "comment")
    pub scope: String,

    /// Color for this token
    pub color: String,

    /// Font style (optional)
    pub font_style: Option<FontStyle>,
}

impl TokenColor {
    /// Creates a new token color
    pub fn new(scope: impl Into<String>, color: impl Into<String>) -> Self {
        Self {
            scope: scope.into(),
            color: color.into(),
            font_style: None,
        }
    }

    /// Sets the font style
    pub fn with_font_style(mut self, font_style: FontStyle) -> Self {
        self.font_style = Some(font_style);
        self
    }
}

/// Font style for tokens
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum FontStyle {
    Normal,
    Italic,
    Bold,
    Underline,
}

/// UI-specific colors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiColors {
    /// Status bar background
    pub status_bar_background: String,

    /// Status bar foreground
    pub status_bar_foreground: String,

    /// Activity bar background
    pub activity_bar_background: String,

    /// Activity bar foreground
    pub activity_bar_foreground: String,

    /// Activity bar active background
    pub activity_bar_active_background: String,

    /// Activity bar active foreground
    pub activity_bar_active_foreground: String,

    /// Side bar background
    pub side_bar_background: String,

    /// Side bar foreground
    pub side_bar_foreground: String,

    /// Editor background
    pub editor_background: String,

    /// Editor foreground
    pub editor_foreground: String,

    /// Editor line number
    pub editor_line_number: String,

    /// Editor selection
    pub editor_selection: String,

    /// Editor cursor
    pub editor_cursor: String,
}

impl Default for UiColors {
    fn default() -> Self {
        Self {
            status_bar_background: "#007acc".to_string(),
            status_bar_foreground: "#ffffff".to_string(),
            activity_bar_background: "#333333".to_string(),
            activity_bar_foreground: "#ffffff".to_string(),
            activity_bar_active_background: "#ffffff".to_string(),
            activity_bar_active_foreground: "#000000".to_string(),
            side_bar_background: "#252526".to_string(),
            side_bar_foreground: "#cccccc".to_string(),
            editor_background: "#ffffff".to_string(),
            editor_foreground: "#000000".to_string(),
            editor_line_number: "#858585".to_string(),
            editor_selection: "#add6ff".to_string(),
            editor_cursor: "#000000".to_string(),
        }
    }
}

impl UiColors {
    /// Creates dark UI colors
    pub fn dark() -> Self {
        Self {
            status_bar_background: "#007acc".to_string(),
            status_bar_foreground: "#ffffff".to_string(),
            activity_bar_background: "#333333".to_string(),
            activity_bar_foreground: "#ffffff".to_string(),
            activity_bar_active_background: "#2c2c2c".to_string(),
            activity_bar_active_foreground: "#ffffff".to_string(),
            side_bar_background: "#252526".to_string(),
            side_bar_foreground: "#cccccc".to_string(),
            editor_background: "#1e1e1e".to_string(),
            editor_foreground: "#d4d4d4".to_string(),
            editor_line_number: "#858585".to_string(),
            editor_selection: "#264f78".to_string(),
            editor_cursor: "#aeafad".to_string(),
        }
    }
}

/// Theme preset
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemePreset {
    /// Preset name
    pub name: String,

    /// Preset description
    pub description: String,

    /// Theme
    pub theme: Theme,
}

impl ThemePreset {
    /// Creates a new theme preset
    pub fn new(name: impl Into<String>, description: impl Into<String>, theme: Theme) -> Self {
        Self {
            name: name.into(),
            description: description.into(),
            theme,
        }
    }
}

/// Built-in themes
pub mod builtin {
    use super::*;

    /// Light theme
    pub fn light() -> Theme {
        Theme::new("light", "Light", ThemeType::Light)
            .with_colors(ThemeColors::default())
            .with_ui_colors(UiColors::default())
    }

    /// Dark theme
    pub fn dark() -> Theme {
        Theme::new("dark", "Dark", ThemeType::Dark)
            .with_colors(ThemeColors::dark())
            .with_ui_colors(UiColors::dark())
    }

    /// High contrast theme
    pub fn high_contrast() -> Theme {
        Theme::new("high-contrast", "High Contrast", ThemeType::HighContrast)
            .with_colors(ThemeColors {
                background: "#000000".to_string(),
                foreground: "#ffffff".to_string(),
                accent: "#ffff00".to_string(),
                border: "#ffffff".to_string(),
                secondary_background: "#1a1a1a".to_string(),
                secondary_foreground: "#ffffff".to_string(),
                disabled_background: "#0a0a0a".to_string(),
                disabled_foreground: "#808080".to_string(),
                error: "#ff0000".to_string(),
                warning: "#ffff00".to_string(),
                success: "#00ff00".to_string(),
                info: "#00ffff".to_string(),
            })
            .with_ui_colors(UiColors {
                status_bar_background: "#000000".to_string(),
                status_bar_foreground: "#ffffff".to_string(),
                activity_bar_background: "#000000".to_string(),
                activity_bar_foreground: "#ffffff".to_string(),
                activity_bar_active_background: "#ffffff".to_string(),
                activity_bar_active_foreground: "#000000".to_string(),
                side_bar_background: "#000000".to_string(),
                side_bar_foreground: "#ffffff".to_string(),
                editor_background: "#000000".to_string(),
                editor_foreground: "#ffffff".to_string(),
                editor_line_number: "#ffffff".to_string(),
                editor_selection: "#ffffff".to_string(),
                editor_cursor: "#ffffff".to_string(),
            })
    }
}
