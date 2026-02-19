use crate::context::RsuiContext;
use eframe::egui::{self, Ui};
use std::any::Any;

/// Error boundary state
#[derive(Debug, Clone)]
pub struct ErrorBoundaryState {
    pub has_error: bool,
    pub error_message: Option<String>,
    pub error_details: Option<String>,
}

impl Default for ErrorBoundaryState {
    fn default() -> Self {
        Self {
            has_error: false,
            error_message: None,
            error_details: None,
        }
    }
}

impl ErrorBoundaryState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_error(&mut self, message: String, details: Option<String>) {
        self.has_error = true;
        self.error_message = Some(message);
        self.error_details = details;
    }

    pub fn clear(&mut self) {
        self.has_error = false;
        self.error_message = None;
        self.error_details = None;
    }

    pub fn is_error(&self) -> bool {
        self.has_error
    }
}

/// Error boundary widget
///
/// Wraps UI content and displays an error message if an error occurs
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The error boundary state
/// * `content` - The UI content to render
/// * `fallback` - Optional fallback UI to show on error
///
/// # Examples
/// ```no_run
/// use rsui::{error_boundary, context::RsuiContext, components::error_boundary::ErrorBoundaryState};
///
/// let mut state = ErrorBoundaryState::new();
/// error_boundary(
///     ui,
///     rsui_ctx,
///     &mut state,
///     |ui| {
///         ui.label("Normal content");
///     },
///     Some(|ui| {
///         ui.label("Something went wrong");
///     })
/// );
/// ```
pub fn error_boundary(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ErrorBoundaryState,
    content: impl FnOnce(&mut Ui),
    fallback: Option<impl FnOnce(&mut Ui)>,
) {
    if state.has_error {
        if let Some(fallback_fn) = fallback {
            fallback_fn(ui);
        } else {
            default_error_fallback(ui, rsui_ctx, state);
        }
    } else {
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            content(ui);
        }));

        if let Err(err) = result {
            state.set_error(
                "An unexpected error occurred".to_string(),
                Some(format!("{:?}", err)),
            );
        }
    }
}

/// Default error fallback UI
fn default_error_fallback(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &ErrorBoundaryState,
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.destructive)
        .stroke(egui::Stroke::new(2.0, theme.destructive))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(24.0, 16.0))
        .show(ui, |ui| {
            ui.vertical(|ui| {
                // Error icon
                ui.label(egui::RichText::new("⚠️").size(48.0));

                ui.add_space(12.0);

                // Error title
                ui.label(
                    egui::RichText::new("Something went wrong")
                        .size(20.0)
                        .color(theme.destructive_foreground)
                        .strong(),
                );

                ui.add_space(8.0);

                // Error message
                if let Some(message) = &state.error_message {
                    ui.label(
                        egui::RichText::new(message)
                            .size(14.0)
                            .color(theme.destructive_foreground),
                    );
                }

                // Error details (collapsible)
                if let Some(details) = &state.error_details {
                    ui.add_space(12.0);
                    ui.collapsing("Show details", |ui| {
                        ui.label(
                            egui::RichText::new(details)
                                .size(12.0)
                                .color(theme.destructive_foreground)
                                .monospace(),
                        );
                    });
                }
            });
        });
}

/// Try-catch wrapper for UI operations
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The error boundary state
/// * `operation` - The operation to execute
///
/// # Examples
/// ```no_run
/// use rsui::{try_catch, context::RsuiContext, components::error_boundary::ErrorBoundaryState};
///
/// let mut state = ErrorBoundaryState::new();
/// try_catch(ui, rsui_ctx, &mut state, || {
///     // Some operation that might fail
///     Ok(())
/// });
/// ```
pub fn try_catch<T: std::fmt::Debug>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ErrorBoundaryState,
    operation: impl FnOnce() -> Result<T, Box<dyn Any>>,
) -> Option<T> {
    match operation() {
        Ok(result) => Some(result),
        Err(err) => {
            state.set_error(
                "An error occurred".to_string(),
                Some(format!("{:?}", err)),
            );
            default_error_fallback(ui, rsui_ctx, state);
            None
        }
    }
}

/// Error alert component
///
/// Displays an error message in an alert-style component
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `title` - The error title
/// * `message` - The error message
/// * `dismissible` - Whether the alert can be dismissed
///
/// # Returns
/// * `bool` - Whether the alert was dismissed
///
/// # Examples
/// ```no_run
/// use rsui::{error_alert, context::RsuiContext};
///
/// let dismissed = error_alert(ui, rsui_ctx, "Error", "Something went wrong", true);
/// ```
pub fn error_alert(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    title: &str,
    message: &str,
    dismissible: bool,
) -> bool {
    let theme = &rsui_ctx.theme;
    let mut dismissed = false;

    egui::Frame::none()
        .fill(theme.destructive)
        .stroke(egui::Stroke::new(1.0, theme.destructive))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(16.0, 12.0))
        .show(ui, |ui| {
            ui.horizontal(|ui| {
                // Icon
                ui.label(egui::RichText::new("⚠️").size(24.0));

                ui.add_space(12.0);

                // Content
                ui.vertical(|ui| {
                    ui.label(
                        egui::RichText::new(title)
                            .size(16.0)
                            .color(theme.destructive_foreground)
                            .strong(),
                    );
                    ui.label(
                        egui::RichText::new(message)
                            .size(14.0)
                            .color(theme.destructive_foreground),
                    );
                });

                // Dismiss button
                if dismissible {
                    ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                        if ui.button("✕").clicked() {
                            dismissed = true;
                        }
                    });
                }
            });
        });

    dismissed
}
