use eframe::egui::{self, Ui};
use crate::context::RsuiContext;
use crate::components::form_types::{FormField, FormFieldType};
use crate::components::form_state::FormState;

/// Render a single form field
pub fn render_field(ui: &mut Ui, rsui_ctx: &RsuiContext, field: &FormField, state: &mut FormState) {
    let theme = &rsui_ctx.theme;

    // Label
    let label = if field.required {
        format!("{} *", field.label)
    } else {
        field.label.clone()
    };
    ui.label(egui::RichText::new(label).size(14.0).color(theme.foreground));

    // Render field based on type
    let current_value = state.get_value(&field.name).cloned().unwrap_or_else(|| {
        field.default_value.clone().unwrap_or_default()
    });

    match field.field_type {
        FormFieldType::Text => {
            let response = ui.text_edit_singleline(&mut current_value.clone());
            if response.changed() {
                state.set_value(&field.name, current_value);
            }
        }
        FormFieldType::Password => {
            let response = ui.add(
                egui::TextEdit::singleline(&mut current_value.clone())
                    .password(true)
            );
            if response.changed() {
                state.set_value(&field.name, current_value);
            }
        }
        FormFieldType::Email => {
            let response = ui.text_edit_singleline(&mut current_value.clone());
            if response.changed() {
                state.set_value(&field.name, current_value);
            }
        }
        FormFieldType::Number => {
            let mut num_value: f64 = current_value.parse().unwrap_or(0.0);
            let response = ui.add(egui::DragValue::new(&mut num_value));
            if response.changed() {
                state.set_value(&field.name, num_value.to_string());
            }
        }
        FormFieldType::Textarea => {
            let response = ui.text_edit_multiline(&mut current_value.clone());
            if response.changed() {
                state.set_value(&field.name, current_value);
            }
        }
        FormFieldType::Checkbox => {
            let mut checked: bool = current_value.parse().unwrap_or(false);
            if ui.checkbox(&mut checked, &field.label).changed() {
                state.set_value(&field.name, checked.to_string());
            }
        }
        FormFieldType::Select => {
            if let Some(options) = &field.options {
                egui::ComboBox::from_label(&field.label)
                    .selected_text(current_value.clone())
                    .show_ui(ui, |ui| {
                        for option in options {
                            if ui.selectable_value(&mut current_value.clone(), option).changed() {
                                state.set_value(&field.name, option.clone());
                            }
                        }
                    });
            }
        }
        FormFieldType::Radio => {
            if let Some(options) = &field.options {
                for option in options {
                    let mut selected = current_value == *option;
                    if ui.radio(&mut selected, option).changed() {
                        state.set_value(&field.name, option.clone());
                    }
                }
            }
        }
        FormFieldType::Date => {
            ui.label(format!("Date: {}", current_value));
            // Date picker would be integrated here
        }
        FormFieldType::Time => {
            ui.label(format!("Time: {}", current_value));
            // Time picker would be integrated here
        }
        FormFieldType::Color => {
            ui.label(format!("Color: {}", current_value));
            // Color picker would be integrated here
        }
        FormFieldType::File => {
            ui.label(format!("File: {}", current_value));
            // File picker would be integrated here
        }
    }

    // Show placeholder
    if let Some(placeholder) = &field.placeholder {
        if current_value.is_empty() {
            ui.label(egui::RichText::new(placeholder).weak().italics());
        }
    }

    // Show field errors
    if state.is_touched(&field.name) {
        for error in state.get_field_errors(&field.name) {
            ui.colored_label(egui::Color32::RED, &error.message);
        }
    }
}
