use crate::context::RsuiContext;
use eframe::egui::{self, Ui};
use std::sync::Arc;

/// Date picker state
#[derive(Debug, Clone)]
pub struct DatePickerState {
    pub year: i32,
    pub month: u32,
    pub day: u32,
    pub show_calendar: bool,
}

impl Default for DatePickerState {
    fn default() -> Self {
        let now = chrono::Local::now();
        Self {
            year: now.year(),
            month: now.month(),
            day: now.day(),
            show_calendar: false,
        }
    }
}

impl DatePickerState {
    pub fn new(year: i32, month: u32, day: u32) -> Self {
        Self {
            year,
            month,
            day,
            show_calendar: false,
        }
    }

    pub fn date_string(&self) -> String {
        format!("{:04}-{:02}-{:02}", self.year, self.month, self.day)
    }

    pub fn days_in_month(&self) -> u32 {
        match self.month {
            1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
            4 | 6 | 9 | 11 => 30,
            2 => {
                if (self.year % 4 == 0 && self.year % 100 != 0) || (self.year % 400 == 0) {
                    29
                } else {
                    28
                }
            }
            _ => 31,
        }
    }

    pub fn first_day_of_month(&self) -> u32 {
        let date = chrono::NaiveDate::from_ymd_opt(self.year, self.month, 1)
            .unwrap_or(chrono::NaiveDate::from_ymd_opt(1970, 1, 1).unwrap());
        date.weekday().num_days_from_sunday()
    }

    pub fn month_name(&self) -> &'static str {
        match self.month {
            1 => "January",
            2 => "February",
            3 => "March",
            4 => "April",
            5 => "May",
            6 => "June",
            7 => "July",
            8 => "August",
            9 => "September",
            10 => "October",
            11 => "November",
            12 => "December",
            _ => "Unknown",
        }
    }
}

/// Date picker widget
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The date picker state
/// * `label` - Optional label for the date picker
///
/// # Examples
/// ```no_run
/// use rsui::{date_picker, context::RsuiContext, components::date_picker::DatePickerState};
///
/// let mut state = DatePickerState::default();
/// date_picker(ui, rsui_ctx, &mut state, Some("Select Date"));
/// ```
pub fn date_picker(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut DatePickerState,
    label: Option<&str>,
) -> egui::Response {
    let id = egui::Id::new("date_picker").with(state.date_string());
    let mut response = ui.horizontal(|ui| {
        if let Some(lbl) = label {
            ui.label(lbl);
        }

        let button_response = ui.button(state.date_string());
        if button_response.clicked() {
            state.show_calendar = !state.show_calendar;
        }

        button_response
    }).response;

    if state.show_calendar {
        egui::Area::new(id)
            .anchor(egui::Align2::LEFT_TOP, response.rect.left_bottom() + egui::vec2(0.0, 5.0))
            .show(ui.ctx(), |ui| {
                ui.vertical(|ui| {
                    calendar_view(ui, rsui_ctx, state);
                });
            });
    }

    response
}

/// Calendar view for date picker
fn calendar_view(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut DatePickerState) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .show(ui, |ui| {
            ui.set_min_size(egui::vec2(280.0, 300.0));

            ui.vertical(|ui| {
                // Header with month/year and navigation
                ui.horizontal(|ui| {
                    if ui.button("<").clicked() {
                        if state.month == 1 {
                            state.month = 12;
                            state.year -= 1;
                        } else {
                            state.month -= 1;
                        }
                    }

                    ui.label(format!("{} {}", state.month_name(), state.year));

                    if ui.button(">").clicked() {
                        if state.month == 12 {
                            state.month = 1;
                            state.year += 1;
                        } else {
                            state.month += 1;
                        }
                    }
                });

                ui.separator();

                // Day names
                ui.horizontal(|ui| {
                    for day in ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] {
                        ui.label(day);
                    }
                });

                ui.separator();

                // Calendar grid
                let first_day = state.first_day_of_month();
                let days_in_month = state.days_in_month();

                let mut current_day = 1;

                for week in 0..6 {
                    ui.horizontal(|ui| {
                        for weekday in 0..7 {
                            let day_num = week * 7 + weekday + 1 - first_day as usize;

                            if day_num > 0 && day_num <= days_in_month as usize {
                                let is_selected = day_num == state.day as usize;

                                if ui
                                    .selectable_label(is_selected, day_num.to_string())
                                    .clicked()
                                {
                                    state.day = day_num as u32;
                                    state.show_calendar = false;
                                }
                            } else {
                                ui.add_space(24.0);
                            }
                        }
                    });

                    if current_day > days_in_month as usize {
                        break;
                    }
                }
            });
        });
}
