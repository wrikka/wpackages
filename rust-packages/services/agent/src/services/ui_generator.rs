//! services/ui_generator.rs

use crate::types::ui::{UiComponent, UiForm};

/// A service that generates HTML from a `UiForm` definition.
#[derive(Clone, Default)]
pub struct UiGenerator;

impl UiGenerator {
    pub fn new() -> Self {
        Self::default()
    }

    /// Generates an HTML string from a `UiForm`.
    pub fn generate_html(&self, form: &UiForm) -> String {
        let components_html: String = form
            .components
            .iter()
            .map(|c| self.generate_component_html(c))
            .collect();

        format!(
            r#"<!DOCTYPE html>
<html>
<head><title>{}</title></head>
<body>
    <h1>{}</h1>
    <form action="/submit" method="post">
        {}
        <button type="submit">Submit</button>
    </form>
</body>
</html>"#,
            form.title,
            form.title,
            components_html
        )
    }

    fn generate_component_html(&self, component: &UiComponent) -> String {
        match component {
            UiComponent::Text { content } => format!("<p>{}</p>", content),
            UiComponent::Button { label, value } => {
                format!("<button type=\"submit\" name=\"action\" value=\"{}\">{}</button>", value, label)
            }
            UiComponent::InputField { label, name } => {
                format!("<label>{}: <input type=\"text\" name=\"{}\"></label><br><br>", label, name)
            }
        }
    }
}
