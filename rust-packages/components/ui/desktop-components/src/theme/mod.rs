use crate::types::theme::RsuiTheme;
use eframe::egui;

pub fn apply(ctx: &egui::Context, theme: &RsuiTheme) {
    let mut style = (*ctx.style()).clone();
    let mut visuals = if theme.dark {
        egui::Visuals::dark()
    } else {
        egui::Visuals::light()
    };

    // Use theme colors for visuals
    visuals.override_text_color = Some(theme.foreground);
    visuals.panel_fill = theme.background;
    visuals.window_fill = theme.card;
    visuals.window_stroke = egui::Stroke::new(1.0, theme.border);
    visuals.selection.bg_fill = theme.primary;
    visuals.selection.stroke = egui::Stroke::new(1.0, theme.ring);

    // Widget colors
    let widgets = &mut visuals.widgets;
    widgets.inactive.bg_fill = theme.secondary;
    widgets.inactive.fg_stroke = egui::Stroke::new(1.0, theme.secondary_foreground);
    widgets.hovered.bg_fill = theme.accent;
    widgets.hovered.fg_stroke = egui::Stroke::new(1.0, theme.accent_foreground);
    widgets.active.bg_fill = theme.primary;
    widgets.active.fg_stroke = egui::Stroke::new(1.0, theme.primary_foreground);

    // Spacing and rounding
    style.spacing.item_spacing = egui::vec2(10.0, 10.0);
    style.spacing.button_padding = egui::vec2(10.0, 8.0);
    style.spacing.window_margin = egui::Margin::same(12);

    let corner_radius = egui::CornerRadius::same(theme.radius as u8);
    visuals.window_corner_radius = corner_radius;
    visuals.menu_corner_radius = corner_radius;

    style.visuals = visuals;
    ctx.set_style(style);
}

pub fn panel_frame(theme: &RsuiTheme) -> egui::Frame {
    egui::Frame::new()
        .fill(theme.card)
        .inner_margin(egui::Margin::symmetric(12, 12))
        .corner_radius(theme.radius)
}

pub fn surface_frame(theme: &RsuiTheme) -> egui::Frame {
    egui::Frame::new()
        .fill(theme.background)
        .inner_margin(egui::Margin::symmetric(12, 10))
        .corner_radius(theme.radius)
}
