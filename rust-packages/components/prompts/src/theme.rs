use crossterm::style::{Color, Stylize};

/// Theme configuration for prompt styling
#[derive(Debug, Clone)]
pub struct Theme {
    pub colors: ColorScheme,
    pub symbols: SymbolSet,
    pub indent: u16,
    pub padding: u16,
}

impl Default for Theme {
    fn default() -> Self {
        Self {
            colors: ColorScheme::default(),
            symbols: SymbolSet::default(),
            indent: 2,
            padding: 1,
        }
    }
}

impl Theme {
    /// Create a new theme with default settings
    pub fn new() -> Self {
        Self::default()
    }

    /// Set color scheme
    pub fn with_colors(mut self, colors: ColorScheme) -> Self {
        self.colors = colors;
        self
    }

    /// Set symbol set
    pub fn with_symbols(mut self, symbols: SymbolSet) -> Self {
        self.symbols = symbols;
        self
    }

    /// Set indentation
    pub fn with_indent(mut self, indent: u16) -> Self {
        self.indent = indent;
        self
    }
}

/// Color scheme for prompts
#[derive(Debug, Clone)]
pub struct ColorScheme {
    pub primary: Color,
    pub secondary: Color,
    pub success: Color,
    pub error: Color,
    pub warning: Color,
    pub info: Color,
    pub muted: Color,
    pub background: Color,
    pub foreground: Color,
}

impl Default for ColorScheme {
    fn default() -> Self {
        Self {
            primary: Color::Cyan,
            secondary: Color::Magenta,
            success: Color::Green,
            error: Color::Red,
            warning: Color::Yellow,
            info: Color::Blue,
            muted: Color::DarkGrey,
            background: Color::Reset,
            foreground: Color::Reset,
        }
    }
}

/// Set of symbols used in prompts
#[derive(Debug, Clone)]
pub struct SymbolSet {
    pub pointer: &'static str,
    pub radio_on: &'static str,
    pub radio_off: &'static str,
    pub checkbox_on: &'static str,
    pub checkbox_off: &'static str,
    pub check: &'static str,
    pub cross: &'static str,
    pub bar: &'static str,
    pub arrow: &'static str,
    pub spinner: &'static [ &'static str ],
    pub line: &'static str,
    pub corner: &'static str,
}

impl Default for SymbolSet {
    fn default() -> Self {
        Self {
            pointer: "❯",
            radio_on: "◉",
            radio_off: "◯",
            checkbox_on: "☑",
            checkbox_off: "☐",
            check: "✔",
            cross: "✖",
            bar: "│",
            arrow: "→",
            spinner: &["◐", "◓", "◑", "◒"],
            line: "─",
            corner: "└",
        }
    }
}

impl SymbolSet {
    /// Unicode symbols
    pub fn unicode() -> Self {
        Self::default()
    }

    /// ASCII fallback symbols
    pub fn ascii() -> Self {
        Self {
            pointer: ">",
            radio_on: "(*)",
            radio_off: "( )",
            checkbox_on: "[x]",
            checkbox_off: "[ ]",
            check: "[OK]",
            cross: "[X]",
            bar: "|",
            arrow: "->",
            spinner: &["|", "/", "-", "\\"],
            line: "-",
            corner: "`-",
        }
    }
}

/// Predefined themes
impl Theme {
    /// Default theme
    pub fn default_theme() -> Self {
        Self::default()
    }

    /// Minimal theme with ASCII symbols
    pub fn minimal() -> Self {
        Self {
            symbols: SymbolSet::ascii(),
            ..Default::default()
        }
    }

    /// High contrast theme for accessibility
    pub fn high_contrast() -> Self {
        Self {
            colors: ColorScheme {
                primary: Color::White,
                secondary: Color::White,
                success: Color::Green,
                error: Color::Red,
                warning: Color::Yellow,
                info: Color::Blue,
                muted: Color::Grey,
                background: Color::Black,
                foreground: Color::White,
            },
            symbols: SymbolSet::ascii(),
            ..Default::default()
        }
    }
}
