use ratatui::style::Color;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub background: ThemeColor,
    pub foreground: ThemeColor,
    pub cursor: ThemeColor,
    pub selection: ThemeColor,
    pub line_number: ThemeColor,
    pub line_number_active: ThemeColor,
    pub syntax_highlight: SyntaxHighlightTheme,
    pub ui: UiTheme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl ThemeColor {
    pub fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }

    pub fn to_color(&self) -> Color {
        Color::Rgb(self.r, self.g, self.b)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyntaxHighlightTheme {
    pub keyword: ThemeColor,
    pub string: ThemeColor,
    pub function: ThemeColor,
    pub variable: ThemeColor,
    pub comment: ThemeColor,
    pub type_color: ThemeColor,
    pub number: ThemeColor,
    pub operator: ThemeColor,
    pub punctuation: ThemeColor,
    pub constant: ThemeColor,
    pub attribute: ThemeColor,
    pub tag: ThemeColor,
    pub special: ThemeColor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiTheme {
    pub border: ThemeColor,
    pub border_active: ThemeColor,
    pub title: ThemeColor,
    pub title_active: ThemeColor,
    pub command_palette: ThemeColor,
    pub file_explorer: ThemeColor,
}
