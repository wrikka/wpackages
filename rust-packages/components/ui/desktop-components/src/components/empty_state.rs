use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Empty state variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EmptyStateVariant {
    Default,
    NoData,
    NoResults,
    NoSelection,
    NoConnection,
    Error,
}

impl Default for EmptyStateVariant {
    fn default() -> Self {
        EmptyStateVariant::Default
    }
}

/// Empty state widget
///
/// Displays a placeholder when there's no content to show
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `variant` - The empty state variant
/// * `title` - The title text
/// * `description` - Optional description text
/// * `action` - Optional action button label and callback
///
/// # Examples
/// ```no_run
/// use rsui::{empty_state, context::RsuiContext, components::empty_state::EmptyStateVariant};
///
/// empty_state(
///     ui,
///     rsui_ctx,
///     EmptyStateVariant::NoData,
///     "No Data",
///     Some("There's no data to display"),
///     Some(("Refresh", || println!("Refresh clicked")))
/// );
/// ```
pub fn empty_state(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    variant: EmptyStateVariant,
    title: &str,
    description: Option<&str>,
    action: Option<(&str, Box<dyn Fn()>)>,
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(32.0, 24.0))
        .show(ui, |ui| {
            ui.vertical_centered(|ui| {
                // Icon based on variant
                let icon_text = match variant {
                    EmptyStateVariant::Default => "📭",
                    EmptyStateVariant::NoData => "📊",
                    EmptyStateVariant::NoResults => "🔍",
                    EmptyStateVariant::NoSelection => "👆",
                    EmptyStateVariant::NoConnection => "🔌",
                    EmptyStateVariant::Error => "⚠️",
                };

                ui.add_space(16.0);

                // Icon
                ui.label(egui::RichText::new(icon_text).size(64.0));

                ui.add_space(16.0);

                // Title
                ui.label(
                    egui::RichText::new(title)
                        .size(20.0)
                        .color(theme.foreground),
                );

                ui.add_space(8.0);

                // Description
                if let Some(desc) = description {
                    ui.label(
                        egui::RichText::new(desc)
                            .size(14.0)
                            .color(theme.card_foreground),
                    );
                }

                ui.add_space(24.0);

                // Action button
                if let Some((label, callback)) = action {
                    if ui.button(label).clicked() {
                        callback();
                    }
                }
            });
        });
}

/// Simple empty state with default styling
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `title` - The title text
/// * `description` - Optional description text
///
/// # Examples
/// ```no_run
/// use rsui::{empty_state_simple, context::RsuiContext};
///
/// empty_state_simple(ui, rsui_ctx, "No Items", Some("Create your first item"));
/// ```
pub fn empty_state_simple(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    title: &str,
    description: Option<&str>,
) {
    empty_state(
        ui,
        rsui_ctx,
        EmptyStateVariant::Default,
        title,
        description,
        None,
    );
}
