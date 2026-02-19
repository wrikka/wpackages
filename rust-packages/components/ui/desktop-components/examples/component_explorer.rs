//! An example demonstrating all the widgets in the `rsui` library.

use rsui::{
    types::{alert::AlertKind, theme::RsuiTheme, toasts::*, widgets::ButtonVariant},
    widgets::*,
    RsuiApp,
};
use std::sync::Arc;

#[derive(PartialEq, Clone, ToString)]
enum SelectOption {
    First,
    Second,
    Third,
}

struct ComponentExplorer {
    theme_is_dark: bool,
    toasts: Toasts,
    show_modal: bool,
    checkbox_value: bool,
    slider_value: f32,
    progress_value: f32,
    text_value: String,
    password_value: String,
    textarea_value: String,
    select_value: SelectOption,
    page: usize,
}

impl Default for ComponentExplorer {
    fn default() -> Self {
        Self {
            theme_is_dark: true,
            toasts: Toasts::default(),
            show_modal: false,
            checkbox_value: false,
            slider_value: 50.0,
            progress_value: 0.3,
            text_value: String::new(),
            password_value: String::new(),
            textarea_value: String::new(),
            select_value: SelectOption::First,
            page: 0,
        }
    }
}

impl RsuiApp for ComponentExplorer {
    fn update(
        &mut self,
        egui_ctx: &eframe::egui::Context,
        rsui_ctx: &mut crate::context::RsuiContext,
    ) {
        if self.theme_is_dark {
            rsui_ctx.theme = Arc::new(RsuiTheme::default());
        } else {
            rsui_ctx.theme = Arc::new(RsuiTheme::light());
        }
        rsui::apply_theme(egui_ctx, &rsui_ctx.theme);

        sidebar(egui_ctx, rsui_ctx, "sidebar", |ui| {
            ui.heading("Sidebar");
            row(ui, |ui| {
                icon(ui, egui_phosphor::regular::HOUSE);
                ui.label("Home");
            });
        });

        eframe::egui::CentralPanel::default().show(egui_ctx, |ui| {
            ui.heading("Component Explorer");

            card(ui, rsui_ctx, |ui| {
                ui.label("Theme");
                row(ui, |ui| {
                    if ui.button("Light").clicked() {
                        self.theme_is_dark = false;
                    }
                    if ui.button("Dark").clicked() {
                        self.theme_is_dark = true;
                    }
                });
            });

            tabs(
                ui,
                rsui_ctx,
                "tabs",
                vec![
                    Tab::new("General", |ui| {
                        self.show_general_tab(ui, rsui_ctx);
                    }),
                    Tab::new("Forms", |ui| {
                        self.show_forms_tab(ui, rsui_ctx);
                    }),
                    Tab::new("Data", |ui| {
                        self.show_data_tab(ui, rsui_ctx);
                    }),
                    Tab::new("Navigation", |ui| {
                        self.show_navigation_tab(ui, rsui_ctx);
                    }),
                ],
            );
        });

        modal(egui_ctx, rsui_ctx, "My Modal", &mut self.show_modal, |ui| {
            ui.label("This is a modal window.");
            if button(ui, rsui_ctx, "Close", ButtonVariant::Secondary).clicked() {
                self.show_modal = false;
            }
        });

        toasts(egui_ctx, rsui_ctx, &mut self.toasts);
    }
}

impl ComponentExplorer {
    fn show_general_tab(
        &mut self,
        ui: &mut eframe::egui::Ui,
        rsui_ctx: &crate::context::RsuiContext,
    ) {
        card(ui, rsui_ctx, |ui| {
            ui.label("Buttons");
            row(ui, |ui| {
                let primary = button(
                    ui,
                    rsui_ctx,
                    "Primary",
                    ButtonVariant::Primary,
                    Some(egui_phosphor::regular::PLUS),
                );
                if primary.clicked() {
                    self.toasts
                        .add(Toast::new(ToastKind::Info, "Primary button clicked"));
                }
                tooltip(primary, "Primary action");

                if button(ui, rsui_ctx, "Secondary", ButtonVariant::Secondary).clicked() {
                    self.toasts
                        .add(Toast::new(ToastKind::Success, "Secondary button clicked"));
                }
                if button(ui, rsui_ctx, "Ghost", ButtonVariant::Ghost).clicked() {
                    self.toasts
                        .add(Toast::new(ToastKind::Warning, "Ghost button clicked"));
                }
                if button(ui, rsui_ctx, "Danger", ButtonVariant::Danger).clicked() {
                    self.toasts
                        .add(Toast::new(ToastKind::Error, "Danger button clicked"));
                }
            });
        });

        card(ui, rsui_ctx, |ui| {
            ui.label("Feedback");
            row(ui, |ui| {
                spinner(ui);
                pill(ui, rsui_ctx, "Pill");
                badge(ui, "Badge", &rsui_ctx.theme);
                avatar(ui, "RG");
            });
            progress(ui, self.progress_value);
        });

        card(ui, rsui_ctx, |ui| {
            ui.label("Overlays");
            if button(ui, rsui_ctx, "Open Modal", ButtonVariant::Primary).clicked() {
                self.show_modal = true;
            }
        });

        card(ui, rsui_ctx, |ui| {
            ui.label("Alerts");
            alert(
                ui,
                rsui_ctx,
                AlertKind::Info,
                "Info",
                "This is an info alert.",
            );
            alert(
                ui,
                rsui_ctx,
                AlertKind::Success,
                "Success",
                "This is a success alert.",
            );
            alert(
                ui,
                rsui_ctx,
                AlertKind::Warning,
                "Warning",
                "This is a warning alert.",
            );
            alert(
                ui,
                rsui_ctx,
                AlertKind::Error,
                "Error",
                "This is an error alert.",
            );
        });
    }

    fn show_forms_tab(
        &mut self,
        ui: &mut eframe::egui::Ui,
        _rsui_ctx: &crate::context::RsuiContext,
    ) {
        card(ui, _rsui_ctx, |ui| {
            ui.label("Inputs");
            text_input(ui, &mut self.text_value, "Text input...");
            password(ui, &mut self.password_value, "Password...");
            textarea(ui, &mut self.textarea_value, "Textarea...");
            select(
                ui,
                "select",
                &mut self.select_value,
                &[
                    SelectOption::First,
                    SelectOption::Second,
                    SelectOption::Third,
                ],
            );
            checkbox(ui, &mut self.checkbox_value, "Checkbox");
            slider(ui, &mut self.slider_value, 0.0..=100.0, "Slider");
        });
    }

    fn show_data_tab(
        &mut self,
        ui: &mut eframe::egui::Ui,
        _rsui_ctx: &crate::context::RsuiContext,
    ) {
        card(ui, _rsui_ctx, |ui| {
            ui.label("Table");
            let columns = [
                egui_extras::Column::auto(),
                egui_extras::Column::auto(),
                egui_extras::Column::remainder(),
            ];
            table(
                ui,
                "table",
                &columns,
                |mut row| {
                    row.col(|ui| {
                        ui.strong("ID");
                    });
                    row.col(|ui| {
                        ui.strong("Name");
                    });
                    row.col(|ui| {
                        ui.strong("Value");
                    });
                },
                |body| {
                    body.rows(20.0, 10, |mut row| {
                        let index = row.index();
                        row.col(|ui| {
                            ui.label(format!("{}", index));
                        });
                        row.col(|ui| {
                            ui.label(format!("Row {}", index));
                        });
                        row.col(|ui| {
                            ui.label(format!("Value {}", index * 10));
                        });
                    });
                },
            );
        });
    }

    fn show_navigation_tab(
        &mut self,
        ui: &mut eframe::egui::Ui,
        _rsui_ctx: &crate::context::RsuiContext,
    ) {
        card(ui, _rsui_ctx, |ui| {
            ui.label("Breadcrumbs");
            breadcrumbs(
                ui,
                vec![
                    BreadcrumbItem::new("Home").on_click(|| {}),
                    BreadcrumbItem::new("Category").on_click(|| {}),
                    BreadcrumbItem::new("Current Page"),
                ],
            );
        });

        card(ui, _rsui_ctx, |ui| {
            ui.label("Pagination");
            pagination(ui, &mut self.page, 10);
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run::<ComponentExplorer>("Component Explorer")
}
