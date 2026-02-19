use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum ThemeVariant {
    Light,
    Dark,
    Auto,
}

impl Default for ThemeVariant {
    fn default() -> Self {
        Self::Dark
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ColorScheme {
    pub background: String,
    pub foreground: String,
    pub cursor: String,
    pub cursor_foreground: Option<String>,
    pub selection: String,
    pub selection_foreground: Option<String>,
    pub black: String,
    pub red: String,
    pub green: String,
    pub yellow: String,
    pub blue: String,
    pub magenta: String,
    pub cyan: String,
    pub white: String,
    pub bright_black: String,
    pub bright_red: String,
    pub bright_green: String,
    pub bright_yellow: String,
    pub bright_blue: String,
    pub bright_magenta: String,
    pub bright_cyan: String,
    pub bright_white: String,
}

impl Default for ColorScheme {
    fn default() -> Self {
        Self {
            background: "#1E1E2E".to_string(),
            foreground: "#CDD6F4".to_string(),
            cursor: "#F5E0DC".to_string(),
            cursor_foreground: None,
            selection: "#45475A".to_string(),
            selection_foreground: None,
            black: "#45475A".to_string(),
            red: "#F38BA8".to_string(),
            green: "#A6E3A1".to_string(),
            yellow: "#F9E2AF".to_string(),
            blue: "#89B4FA".to_string(),
            magenta: "#F5C2E7".to_string(),
            cyan: "#94E2D5".to_string(),
            white: "#BAC2DE".to_string(),
            bright_black: "#585B70".to_string(),
            bright_red: "#F38BA8".to_string(),
            bright_green: "#A6E3A1".to_string(),
            bright_yellow: "#F9E2AF".to_string(),
            bright_blue: "#89B4FA".to_string(),
            bright_magenta: "#F5C2E7".to_string(),
            bright_cyan: "#94E2D5".to_string(),
            bright_white: "#A6ADC8".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeUI {
    pub tab_bar: ThemeTabBar,
    pub status_bar: ThemeStatusBar,
    pub command_palette: ThemeCommandPalette,
    pub scroll_bar: ThemeScrollBar,
}

impl Default for ThemeUI {
    fn default() -> Self {
        Self {
            tab_bar: ThemeTabBar::default(),
            status_bar: ThemeStatusBar::default(),
            command_palette: ThemeCommandPalette::default(),
            scroll_bar: ThemeScrollBar::default(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeTabBar {
    pub background: String,
    pub foreground: String,
    pub active_tab: ThemeTab,
    pub inactive_tab: ThemeTab,
    pub hover_tab: ThemeTab,
}

impl Default for ThemeTabBar {
    fn default() -> Self {
        Self {
            background: "#181825".to_string(),
            foreground: "#CDD6F4".to_string(),
            active_tab: ThemeTab {
                background: "#313244".to_string(),
                foreground: "#CDD6F4".to_string(),
                border: "#89B4FA".to_string(),
            },
            inactive_tab: ThemeTab {
                background: "#181825".to_string(),
                foreground: "#6C7086".to_string(),
                border: "transparent".to_string(),
            },
            hover_tab: ThemeTab {
                background: "#1E1E2E".to_string(),
                foreground: "#CDD6F4".to_string(),
                border: "#45475A".to_string(),
            },
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeTab {
    pub background: String,
    pub foreground: String,
    pub border: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeStatusBar {
    pub background: String,
    pub foreground: String,
    pub separator: String,
}

impl Default for ThemeStatusBar {
    fn default() -> Self {
        Self {
            background: "#181825".to_string(),
            foreground: "#CDD6F4".to_string(),
            separator: "#45475A".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeCommandPalette {
    pub background: String,
    pub foreground: String,
    pub border: String,
    pub selected_background: String,
    pub selected_foreground: String,
}

impl Default for ThemeCommandPalette {
    fn default() -> Self {
        Self {
            background: "#1E1E2E".to_string(),
            foreground: "#CDD6F4".to_string(),
            border: "#45475A".to_string(),
            selected_background: "#313244".to_string(),
            selected_foreground: "#CDD6F4".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ThemeScrollBar {
    pub background: String,
    pub foreground: String,
    pub hover_foreground: String,
}

impl Default for ThemeScrollBar {
    fn default() -> Self {
        Self {
            background: "#181825".to_string(),
            foreground: "#45475A".to_string(),
            hover_foreground: "#585B70".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Theme {
    pub id: String,
    pub name: String,
    pub variant: ThemeVariant,
    pub colors: ColorScheme,
    pub ui: ThemeUI,
    pub description: Option<String>,
    pub author: Option<String>,
    pub version: String,
    pub custom_properties: HashMap<String, String>,
}

impl Default for Theme {
    fn default() -> Self {
        Self {
            id: "default-dark".to_string(),
            name: "Default Dark".to_string(),
            variant: ThemeVariant::Dark,
            colors: ColorScheme::default(),
            ui: ThemeUI::default(),
            description: Some("Default dark theme".to_string()),
            author: Some("WAI".to_string()),
            version: "1.0.0".to_string(),
            custom_properties: HashMap::new(),
        }
    }
}

impl Theme {
    pub fn new(name: String, variant: ThemeVariant) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            variant,
            colors: ColorScheme::default(),
            ui: ThemeUI::default(),
            description: None,
            author: None,
            version: "1.0.0".to_string(),
            custom_properties: HashMap::new(),
        }
    }

    pub fn set_property(&mut self, key: String, value: String) {
        self.custom_properties.insert(key, value);
    }

    pub fn get_property(&self, key: &str) -> Option<&String> {
        self.custom_properties.get(key)
    }

    pub fn is_dark(&self) -> bool {
        matches!(self.variant, ThemeVariant::Dark)
    }

    pub fn is_light(&self) -> bool {
        matches!(self.variant, ThemeVariant::Light)
    }
}
