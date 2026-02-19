#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Rgb {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Rgb {
    pub const fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ThemeColors {
    pub background: Rgb,
    pub foreground: Rgb,

    pub primary: Rgb,
    pub primary_foreground: Rgb,

    pub secondary: Rgb,
    pub secondary_foreground: Rgb,

    pub accent: Rgb,
    pub accent_foreground: Rgb,

    pub destructive: Rgb,
    pub destructive_foreground: Rgb,

    pub card: Rgb,
    pub card_foreground: Rgb,

    pub popover: Rgb,
    pub popover_foreground: Rgb,

    pub border: Rgb,
    pub input: Rgb,
    pub ring: Rgb,

    // File types
    pub file_directory: Rgb,
    pub file_code: Rgb,
    pub file_text: Rgb,
    pub file_image: Rgb,
    pub file_archive: Rgb,

    // Status
    pub error: Rgb,
    pub warning: Rgb,
    pub success: Rgb,
    pub info: Rgb,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ThemeTokens {
    pub name: &'static str,
    pub dark: bool,
    pub radius: f32,
    pub colors: ThemeColors,
}

impl ThemeTokens {
    pub const fn dark() -> Self {
        Self {
            name: "wai-dark",
            dark: true,
            radius: 12.0,
            colors: ThemeColors {
                // Align with rsui defaults for cross-UI consistency
                background: Rgb::new(10, 10, 12),
                foreground: Rgb::new(230, 230, 232),

                primary: Rgb::new(86, 108, 255),
                primary_foreground: Rgb::new(240, 240, 242),

                secondary: Rgb::new(50, 50, 54),
                secondary_foreground: Rgb::new(230, 230, 232),

                accent: Rgb::new(60, 60, 64),
                accent_foreground: Rgb::new(240, 240, 242),

                destructive: Rgb::new(239, 68, 68),
                destructive_foreground: Rgb::new(240, 240, 242),

                card: Rgb::new(16, 16, 18),
                card_foreground: Rgb::new(230, 230, 232),

                popover: Rgb::new(20, 20, 22),
                popover_foreground: Rgb::new(230, 230, 232),

                border: Rgb::new(40, 40, 44),
                input: Rgb::new(40, 40, 44),
                ring: Rgb::new(86, 108, 255),

                // File types (close to tui-components current scheme)
                file_directory: Rgb::new(121, 85, 72),
                file_code: Rgb::new(102, 187, 106),
                file_text: Rgb::new(230, 230, 232),
                file_image: Rgb::new(255, 167, 38),
                file_archive: Rgb::new(255, 238, 88),

                // Status
                error: Rgb::new(239, 68, 68),
                warning: Rgb::new(255, 202, 40),
                success: Rgb::new(102, 187, 106),
                info: Rgb::new(86, 108, 255),
            },
        }
    }

    pub const fn light() -> Self {
        Self {
            name: "wai-light",
            dark: false,
            radius: 12.0,
            colors: ThemeColors {
                background: Rgb::new(248, 248, 250),
                foreground: Rgb::new(20, 20, 22),

                primary: Rgb::new(86, 108, 255),
                primary_foreground: Rgb::new(240, 240, 242),

                secondary: Rgb::new(220, 220, 224),
                secondary_foreground: Rgb::new(20, 20, 22),

                accent: Rgb::new(230, 230, 234),
                accent_foreground: Rgb::new(16, 16, 18),

                destructive: Rgb::new(239, 68, 68),
                destructive_foreground: Rgb::new(240, 240, 242),

                card: Rgb::new(255, 255, 255),
                card_foreground: Rgb::new(20, 20, 22),

                popover: Rgb::new(255, 255, 255),
                popover_foreground: Rgb::new(20, 20, 22),

                border: Rgb::new(210, 210, 214),
                input: Rgb::new(210, 210, 214),
                ring: Rgb::new(86, 108, 255),

                file_directory: Rgb::new(141, 110, 99),
                file_code: Rgb::new(67, 160, 71),
                file_text: Rgb::new(20, 20, 22),
                file_image: Rgb::new(245, 124, 0),
                file_archive: Rgb::new(251, 192, 45),

                error: Rgb::new(211, 47, 47),
                warning: Rgb::new(245, 124, 0),
                success: Rgb::new(67, 160, 71),
                info: Rgb::new(86, 108, 255),
            },
        }
    }
}
