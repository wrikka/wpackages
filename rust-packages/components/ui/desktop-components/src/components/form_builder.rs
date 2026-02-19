use crate::context::RsuiContext;
use eframe::egui::{self, Ui};
use crate::components::form_types::FormField;
use crate::components::form_state::FormState;
use crate::components::form_field_renderer::render_field;
use crate::components::form_validation::validate_form;

/// Form builder widget
///
/// Dynamic form generation with validation
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `fields` - List of form fields
/// * `state` - The form state
///
/// # Returns
/// * Whether the form is valid
///
/// # Examples
/// ```no_run
/// use rsui::{form_builder, context::RsuiContext, components::form_builder::{FormField, FormFieldType, FormState}};
///
/// let fields = vec![
///     FormField::new("name", "Name", FormFieldType::Text).required(),
///     FormField::new("email", "Email", FormFieldType::Email).required(),
/// ];
/// let mut state = FormState::new();
/// let valid = form_builder(ui, rsui_ctx, &fields, &mut state);
/// ```
pub fn form_builder(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    fields: &[FormField],
    state: &mut FormState,
) -> bool {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(24.0, 24.0))
        .show(ui, |ui| {
            ui.vertical(|ui| {
                for field in fields {
                    render_field(ui, rsui_ctx, field, state);
                    ui.add_space(16.0);
                }

                // Validation button
                if ui.button("Validate").clicked() {
                    state.clear_errors();
                    validate_form(fields, state);
                }

                // Show errors
                if !state.errors.is_empty() {
                    ui.add_space(16.0);
                    ui.colored_label(egui::Color32::RED, "Errors:");
                    for error in &state.errors {
                        ui.colored_label(egui::Color32::RED, &format!("  - {}: {}", error.field_name, error.message));
                    }
                }
            });
        });

    state.is_valid()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::components::form_types::FormFieldType;
    use crate::components::form_validation::FormValidation;

    #[test]
    fn test_form_field() {
        let field = FormField::new("name", "Name", FormFieldType::Text)
            .required()
            .with_placeholder("Enter name");

        assert_eq!(field.name, "name");
        assert_eq!(field.label, "Name");
        assert!(field.required);
        assert_eq!(field.placeholder, Some("Enter name".to_string()));
    }

    #[test]
    fn test_form_state() {
        let mut state = FormState::new();
        
        assert!(state.is_valid());
        assert!(!state.is_touched("name"));
        
        state.set_value("name", "test".to_string());
        assert_eq!(state.get_value("name"), Some(&"test".to_string()));
        assert!(state.is_touched("name"));
    }

    #[test]
    fn test_form_validation() {
        let validation = FormValidation::new()
            .min_length(3)
            .max_length(10);

        assert_eq!(validation.min_length, Some(3));
        assert_eq!(validation.max_length, Some(10));
    }

    #[test]
    fn test_form_error() {
        use crate::components::form_types::FormError;
        let error = FormError::new("name", "Name is required");
        assert_eq!(error.field_name, "name");
        assert_eq!(error.message, "Name is required");
    }
}
