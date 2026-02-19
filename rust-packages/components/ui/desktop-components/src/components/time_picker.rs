use crate::context::RsuiContext;
use eframe::egui::{self, Ui};
use chrono::Timelike;

/// Time picker state
#[derive(Debug, Clone)]
pub struct TimePickerState {
    pub hour: u32,
    pub minute: u32,
    pub second: u32,
    pub show_picker: bool,
}

impl Default for TimePickerState {
    fn default() -> Self {
        let now = chrono::Local::now();
        Self {
            hour: now.hour(),
            minute: now.minute(),
            second: now.second(),
            show_picker: false,
        }
    }
}

impl TimePickerState {
    pub fn new(hour: u32, minute: u32, second: u32) -> Self {
        Self {
            hour: hour.min(23),
            minute: minute.min(59),
            second: second.min(59),
            show_picker: false,
        }
    }

    pub fn time_string(&self) -> String {
        format!("{:02}:{:02}:{:02}", self.hour, self.minute, self.second)
    }
}

/// Time picker widget
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The time picker state
/// * `label` - Optional label for the time picker
///
/// # Examples
/// ```no_run
/// use rsui::{time_picker, context::RsuiContext, components::time_picker::TimePickerState};
///
/// let mut state = TimePickerState::default();
/// time_picker(ui, rsui_ctx, &mut state, Some("Select Time"));
/// ```
pub fn time_picker(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut TimePickerState,
    label: Option<&str>,
) -> egui::Response {
    let id = egui::Id::new("time_picker").with(state.time_string());
    let mut response = ui.horizontal(|ui| {
        if let Some(lbl) = label {
            ui.label(lbl);
        }

        let button_response = ui.button(state.time_string());
        if button_response.clicked() {
            state.show_picker = !state.show_picker;
        }

        button_response
    }).response;

    if state.show_picker {
        egui::Area::new(id)
            .fixed_pos(response.rect.left_bottom() + egui::vec2(0.0, 5.0))
            .show(ui.ctx(), |ui| {
                time_picker_view(ui, rsui_ctx, state);
            });
    }

    response
}

/// Time picker view
fn time_picker_view(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut TimePickerState) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .show(ui, |ui| {
            ui.set_min_size(egui::vec2(200.0, 250.0));

            ui.vertical(|ui| {
                // Hour
                ui.label("Hour:");
                ui.horizontal(|ui| {
                    if ui.button("-").clicked() && state.hour > 0 {
                        state.hour -= 1;
                    }
                    ui.label(format!("{:02}", state.hour));
                    if ui.button("+").clicked() && state.hour < 23 {
                        state.hour += 1;
                    }
                });

                // Minute
                ui.label("Minute:");
                ui.horizontal(|ui| {
                    if ui.button("-").clicked() && state.minute > 0 {
                        state.minute -= 1;
                    }
                    ui.label(format!("{:02}", state.minute));
                    if ui.button("+").clicked() && state.minute < 59 {
                        state.minute += 1;
                    }
                });

                // Second
                ui.label("Second:");
                ui.horizontal(|ui| {
                    if ui.button("-").clicked() && state.second > 0 {
                        state.second -= 1;
                    }
                    ui.label(format!("{:02}", state.second));
                    if ui.button("+").clicked() && state.second < 59 {
                        state.second += 1;
                    }
                });

                ui.separator();

                if ui.button("Done").clicked() {
                    state.show_picker = false;
                }
            });
        });
}
