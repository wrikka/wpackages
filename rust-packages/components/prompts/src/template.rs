use crate::error::Result;
use std::collections::HashMap;
use tinytemplate::TinyTemplate;

/// Render a template string with context
pub fn render_template(template: &str, context: &HashMap<String, String>) -> Result<String> {
    let mut tt = TinyTemplate::new();
    tt.add_template("template", template)
        .map_err(|e| crate::error::Error::Template(e.to_string()))?;
    
    let rendered = tt
        .render("template", context)
        .map_err(|e| crate::error::Error::Template(e.to_string()))?;
    
    Ok(rendered)
}

/// Template context builder
pub struct TemplateContext {
    data: HashMap<String, String>,
}

impl TemplateContext {
    pub fn new() -> Self {
        Self {
            data: HashMap::new(),
        }
    }

    pub fn with(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.data.insert(key.into(), value.into());
        self
    }

    pub fn build(self) -> HashMap<String, String> {
        self.data
    }
}

impl Default for TemplateContext {
    fn default() -> Self {
        Self::new()
    }
}

/// Message formatter with template support
pub struct MessageFormatter;

impl MessageFormatter {
    /// Format a message with optional template variables
    pub fn format(template: &str, vars: &HashMap<String, String>) -> String {
        let mut result = template.to_string();
        for (key, value) in vars {
            result = result.replace(&format!("{{{{{}}}}}", key), value);
        }
        result
    }

    /// Truncate text to width with ellipsis
    pub fn truncate(text: &str, width: usize) -> String {
        if text.len() <= width {
            text.to_string()
        } else {
            format!("{}...", &text[..width.saturating_sub(3)])
        }
    }
}
