use egui::{Color32, CornerRadius, Frame, Margin, RichText, Stroke, Ui};

pub fn section_header(ui: &mut Ui, title: &str) {
    ui.add_space(2.0);
    ui.label(RichText::new(title).strong().size(16.0));
    ui.add_space(2.0);
    ui.separator();
}

pub fn badge(ui: &mut Ui, text: &str, kind: BadgeKind) {
    let (fill, fg) = match kind {
        BadgeKind::Info => (Color32::from_rgb(45, 68, 120), Color32::WHITE),
        BadgeKind::Warn => (
            Color32::from_rgb(120, 78, 40),
            Color32::from_rgb(255, 230, 200),
        ),
        BadgeKind::Danger => (
            Color32::from_rgb(120, 45, 55),
            Color32::from_rgb(255, 220, 220),
        ),
        BadgeKind::Neutral => (
            Color32::from_rgb(45, 45, 50),
            Color32::from_rgb(220, 220, 220),
        ),
    };

    Frame::NONE
        .fill(fill)
        .stroke(Stroke::new(1.0, Color32::from_rgb(60, 60, 70)))
        .corner_radius(CornerRadius::same(8))
        .inner_margin(Margin::symmetric(8, 4))
        .show(ui, |ui| {
            ui.label(RichText::new(text).small().color(fg));
        });
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BadgeKind {
    Info,
    Warn,
    Danger,
    Neutral,
}
