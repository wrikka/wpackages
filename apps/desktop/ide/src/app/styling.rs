pub fn apply_ui_config(ctx: &egui::Context, cfg: &crate::config::app_config::AppConfig) {
    let mut style = (*ctx.style()).clone();
    style.visuals = if cfg.ui.theme_dark {
        egui::Visuals::dark()
    } else {
        egui::Visuals::light()
    };

    // Apply font scaling via text styles.
    let base = cfg.ui.font_size.max(10.0);
    style
        .text_styles
        .insert(egui::TextStyle::Body, egui::FontId::proportional(base));
    style
        .text_styles
        .insert(egui::TextStyle::Monospace, egui::FontId::monospace(base));
    style
        .text_styles
        .insert(egui::TextStyle::Button, egui::FontId::proportional(base));
    style.text_styles.insert(
        egui::TextStyle::Heading,
        egui::FontId::proportional(base + 5.0),
    );

    ctx.set_style(style);
}
