use crate::{context::RsuiContext, types::widgets::ButtonVariant};
use eframe::egui;

pub fn button(
    ui: &mut egui::Ui,
    ctx: &RsuiContext,
    label: impl Into<String>,
    variant: ButtonVariant,
    icon: Option<char>,
) -> egui::Response {
    let theme = &ctx.theme;
    let (bg, fg, stroke) = match variant {
        ButtonVariant::Primary => (
            theme.primary,
            theme.primary_foreground,
            egui::Stroke::new(1.0, theme.ring),
        ),
        ButtonVariant::Secondary => (
            theme.secondary,
            theme.secondary_foreground,
            egui::Stroke::new(1.0, theme.border),
        ),
        ButtonVariant::Ghost => (
            egui::Color32::TRANSPARENT,
            theme.foreground,
            egui::Stroke::NONE,
        ),
        ButtonVariant::Danger => (
            theme.destructive,
            theme.destructive_foreground,
            egui::Stroke::new(1.0, theme.destructive),
        ),
    };

    let label_str: String = label.into();
    let text = if let Some(icon) = icon {
        format!("{}  {}", icon, label_str)
    } else {
        label_str
    };
    let text = egui::RichText::new(text).color(fg);

    ui.add(
        egui::Button::new(text)
            .fill(bg)
            .stroke(stroke)
            .corner_radius(theme.radius),
    )
}
