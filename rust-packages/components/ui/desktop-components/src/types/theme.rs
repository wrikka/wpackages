use eframe::egui;
use serde::{Deserialize, Serialize};

fn rgb_to_color32(rgb: ui_theme::Rgb) -> egui::Color32 {
    egui::Color32::from_rgb(rgb.r, rgb.g, rgb.b)
}

#[derive(Debug, Clone)]
pub struct RsuiTheme {
    pub name: String,
    pub dark: bool,
    pub background: egui::Color32,
    pub foreground: egui::Color32,
    pub primary: egui::Color32,
    pub primary_foreground: egui::Color32,
    pub secondary: egui::Color32,
    pub secondary_foreground: egui::Color32,
    pub accent: egui::Color32,
    pub accent_foreground: egui::Color32,
    pub destructive: egui::Color32,
    pub destructive_foreground: egui::Color32,
    pub card: egui::Color32,
    pub card_foreground: egui::Color32,
    pub popover: egui::Color32,
    pub popover_foreground: egui::Color32,
    pub border: egui::Color32,
    pub input: egui::Color32,
    pub ring: egui::Color32,
    pub radius: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RsuiThemeSerde {
    pub name: String,
    pub dark: bool,
    pub background: [u8; 4],
    pub foreground: [u8; 4],
    pub primary: [u8; 4],
    pub primary_foreground: [u8; 4],
    pub secondary: [u8; 4],
    pub secondary_foreground: [u8; 4],
    pub accent: [u8; 4],
    pub accent_foreground: [u8; 4],
    pub destructive: [u8; 4],
    pub destructive_foreground: [u8; 4],
    pub card: [u8; 4],
    pub card_foreground: [u8; 4],
    pub popover: [u8; 4],
    pub popover_foreground: [u8; 4],
    pub border: [u8; 4],
    pub input: [u8; 4],
    pub ring: [u8; 4],
    pub radius: f32,
}

impl From<RsuiThemeSerde> for RsuiTheme {
    fn from(s: RsuiThemeSerde) -> Self {
        Self {
            name: s.name,
            dark: s.dark,
            background: egui::Color32::from_rgba_unmultiplied(s.background[0], s.background[1], s.background[2], s.background[3]),
            foreground: egui::Color32::from_rgba_unmultiplied(s.foreground[0], s.foreground[1], s.foreground[2], s.foreground[3]),
            primary: egui::Color32::from_rgba_unmultiplied(s.primary[0], s.primary[1], s.primary[2], s.primary[3]),
            primary_foreground: egui::Color32::from_rgba_unmultiplied(s.primary_foreground[0], s.primary_foreground[1], s.primary_foreground[2], s.primary_foreground[3]),
            secondary: egui::Color32::from_rgba_unmultiplied(s.secondary[0], s.secondary[1], s.secondary[2], s.secondary[3]),
            secondary_foreground: egui::Color32::from_rgba_unmultiplied(s.secondary_foreground[0], s.secondary_foreground[1], s.secondary_foreground[2], s.secondary_foreground[3]),
            accent: egui::Color32::from_rgba_unmultiplied(s.accent[0], s.accent[1], s.accent[2], s.accent[3]),
            accent_foreground: egui::Color32::from_rgba_unmultiplied(s.accent_foreground[0], s.accent_foreground[1], s.accent_foreground[2], s.accent_foreground[3]),
            destructive: egui::Color32::from_rgba_unmultiplied(s.destructive[0], s.destructive[1], s.destructive[2], s.destructive[3]),
            destructive_foreground: egui::Color32::from_rgba_unmultiplied(s.destructive_foreground[0], s.destructive_foreground[1], s.destructive_foreground[2], s.destructive_foreground[3]),
            card: egui::Color32::from_rgba_unmultiplied(s.card[0], s.card[1], s.card[2], s.card[3]),
            card_foreground: egui::Color32::from_rgba_unmultiplied(s.card_foreground[0], s.card_foreground[1], s.card_foreground[2], s.card_foreground[3]),
            popover: egui::Color32::from_rgba_unmultiplied(s.popover[0], s.popover[1], s.popover[2], s.popover[3]),
            popover_foreground: egui::Color32::from_rgba_unmultiplied(s.popover_foreground[0], s.popover_foreground[1], s.popover_foreground[2], s.popover_foreground[3]),
            border: egui::Color32::from_rgba_unmultiplied(s.border[0], s.border[1], s.border[2], s.border[3]),
            input: egui::Color32::from_rgba_unmultiplied(s.input[0], s.input[1], s.input[2], s.input[3]),
            ring: egui::Color32::from_rgba_unmultiplied(s.ring[0], s.ring[1], s.ring[2], s.ring[3]),
            radius: s.radius,
        }
    }
}

impl From<&RsuiTheme> for RsuiThemeSerde {
    fn from(t: &RsuiTheme) -> Self {
        Self {
            name: t.name.clone(),
            dark: t.dark,
            background: t.background.to_array(),
            foreground: t.foreground.to_array(),
            primary: t.primary.to_array(),
            primary_foreground: t.primary_foreground.to_array(),
            secondary: t.secondary.to_array(),
            secondary_foreground: t.secondary_foreground.to_array(),
            accent: t.accent.to_array(),
            accent_foreground: t.accent_foreground.to_array(),
            destructive: t.destructive.to_array(),
            destructive_foreground: t.destructive_foreground.to_array(),
            card: t.card.to_array(),
            card_foreground: t.card_foreground.to_array(),
            popover: t.popover.to_array(),
            popover_foreground: t.popover_foreground.to_array(),
            border: t.border.to_array(),
            input: t.input.to_array(),
            ring: t.ring.to_array(),
            radius: t.radius,
        }
    }
}

impl Serialize for RsuiTheme {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        RsuiThemeSerde::from(self).serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for RsuiTheme {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = RsuiThemeSerde::deserialize(deserializer)?;
        Ok(Self::from(s))
    }
}

impl RsuiTheme {
    pub fn light() -> Self {
        Self::from_tokens(ui_theme::ThemeTokens::light())
    }

    pub fn dark() -> Self {
        Self::from_tokens(ui_theme::ThemeTokens::dark())
    }

     pub fn from_tokens(tokens: ui_theme::ThemeTokens) -> Self {
         let c = tokens.colors;
         Self {
             name: tokens.name.to_string(),
             dark: tokens.dark,
             background: rgb_to_color32(c.background),
             foreground: rgb_to_color32(c.foreground),
             primary: rgb_to_color32(c.primary),
             primary_foreground: rgb_to_color32(c.primary_foreground),
             secondary: rgb_to_color32(c.secondary),
             secondary_foreground: rgb_to_color32(c.secondary_foreground),
             accent: rgb_to_color32(c.accent),
             accent_foreground: rgb_to_color32(c.accent_foreground),
             destructive: rgb_to_color32(c.destructive),
             destructive_foreground: rgb_to_color32(c.destructive_foreground),
             card: rgb_to_color32(c.card),
             card_foreground: rgb_to_color32(c.card_foreground),
             popover: rgb_to_color32(c.popover),
             popover_foreground: rgb_to_color32(c.popover_foreground),
             border: rgb_to_color32(c.border),
             input: rgb_to_color32(c.input),
             ring: rgb_to_color32(c.ring),
             radius: tokens.radius,
         }
     }
}

impl Default for RsuiTheme {
    fn default() -> Self {
        Self::from_tokens(ui_theme::ThemeTokens::dark())
    }
}
