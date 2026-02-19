use crate::error::{Error, Result};
use crate::prompt::{Confirm, Select, Text, Number};
use crate::theme::Theme;
use crate::validation::{ValidationChain, Validator};
use dyn_clone::DynClone;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Field type for form fields
#[derive(Debug, Clone)]
pub enum FieldType {
    Text,
    Password,
    Number,
    Confirm,
    Select(Vec<String>),
    MultiSelect(Vec<String>),
    Editor,
    Path,
    Custom(Box<dyn FieldRenderer>),
}

/// Field renderer trait for custom fields
dyn_clone::clone_trait_object!(FieldRenderer);
pub trait FieldRenderer: Send + Sync + DynClone {
    fn render(&self) -> Result<String>;
}

/// Form field definition
#[derive(Clone)]
pub struct Field {
    pub name: String,
    pub label: String,
    pub field_type: FieldType,
    pub required: bool,
    pub placeholder: Option<String>,
    pub default: Option<String>,
    pub help: Option<String>,
    pub validators: ValidationChain<String>,
    pub condition: Option<Box<dyn Fn(&HashMap<String, serde_json::Value>) -> bool + Send + Sync>>,
}

impl Field {
    pub fn new(name: impl Into<String>, label: impl Into<String>, field_type: FieldType) -> Self {
        Self {
            name: name.into(),
            label: label.into(),
            field_type,
            required: true,
            placeholder: None,
            default: None,
            help: None,
            validators: ValidationChain::new(),
            condition: None,
        }
    }

    pub fn optional(mut self) -> Self {
        self.required = false;
        self
    }

    pub fn with_placeholder(mut self, placeholder: impl Into<String>) -> Self {
        self.placeholder = Some(placeholder.into());
        self
    }

    pub fn with_default(mut self, default: impl Into<String>) -> Self {
        self.default = Some(default.into());
        self
    }

    pub fn with_help(mut self, help: impl Into<String>) -> Self {
        self.help = Some(help.into());
        self
    }

    pub fn with_validator<V>(mut self, validator: V) -> Self
    where
        V: Validator<String> + 'static,
    {
        self.validators = self.validators.add(validator);
        self
    }

    pub fn when<F>(mut self, condition: F) -> Self
    where
        F: Fn(&HashMap<String, serde_json::Value>) -> bool + Send + Sync + 'static,
    {
        self.condition = Some(Box::new(condition));
        self
    }

    pub fn should_show(&self, data: &HashMap<String, serde_json::Value>) -> bool {
        self.condition.as_ref().map(|c| c(data)).unwrap_or(true)
    }
}

impl std::fmt::Debug for Field {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Field")
            .field("name", &self.name)
            .field("label", &self.label)
            .field("required", &self.required)
            .finish()
    }
}

/// Form builder for multi-step input
#[derive(Clone)]
pub struct Form {
    title: Option<String>,
    description: Option<String>,
    fields: Vec<Field>,
    theme: Theme,
    allow_undo: bool,
    data: HashMap<String, serde_json::Value>,
}

impl Form {
    pub fn new() -> Self {
        Self {
            title: None,
            description: None,
            fields: Vec::new(),
            theme: Theme::default(),
            allow_undo: true,
            data: HashMap::new(),
        }
    }

    pub fn with_title(mut self, title: impl Into<String>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn with_description(mut self, desc: impl Into<String>) -> Self {
        self.description = Some(desc.into());
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub fn allow_undo(mut self, allow: bool) -> Self {
        self.allow_undo = allow;
        self
    }

    pub fn add_field(mut self, field: Field) -> Self {
        self.fields.push(field);
        self
    }

    /// Run the form interactively
    pub async fn interact(mut self) -> Result<HashMap<String, serde_json::Value>> {
        // Print header
        if let Some(title) = &self.title {
            println!("\n{}", title);
            println!("{}", "─".repeat(title.len()));
        }
        if let Some(desc) = &self.description {
            println!("{}", desc);
        }
        println!();

        let mut current_idx = 0;
        let mut history: Vec<HashMap<String, serde_json::Value>> = Vec::new();

        while current_idx < self.fields.len() {
            let field = &self.fields[current_idx];

            // Check condition
            if !field.should_show(&self.data) {
                current_idx += 1;
                continue;
            }

            // Save state for undo
            if self.allow_undo {
                history.push(self.data.clone());
            }

            // Render field prompt
            match self.prompt_field(field).await {
                Ok(value) => {
                    self.data.insert(field.name.clone(), value);
                    current_idx += 1;
                }
                Err(Error::Cancelled) => {
                    // Handle undo (Ctrl+Z)
                    if self.allow_undo && !history.is_empty() {
                        self.data = history.pop().unwrap();
                        if current_idx > 0 {
                            current_idx -= 1;
                        }
                        continue;
                    }
                    return Err(Error::Cancelled);
                }
                Err(e) => return Err(e),
            }
        }

        Ok(self.data)
    }

    async fn prompt_field(&self, field: &Field) -> Result<serde_json::Value> {
        use serde_json::json;

        let prompt_text = if field.required {
            format!("{} *", field.label)
        } else {
            field.label.clone()
        };

        match &field.field_type {
            FieldType::Text => {
                let mut builder = Text::new(&prompt_text);
                if let Some(placeholder) = &field.placeholder {
                    builder = builder.placeholder(placeholder);
                }
                if let Some(default) = &field.default {
                    builder = builder.default(default);
                }
                let value = builder.interact().await?;
                field.validators.validate(&value)?;
                Ok(json!(value))
            }
            FieldType::Password => {
                let value = Text::new(&prompt_text).secret().interact().await?;
                Ok(json!(value))
            }
            FieldType::Number => {
                let mut builder = Number::<f64>::new(&prompt_text);
                if let Some(default) = &field.default {
                    if let Ok(n) = default.parse() {
                        builder = builder.default(n);
                    }
                }
                let value = builder.interact().await?;
                Ok(json!(value))
            }
            FieldType::Confirm => {
                let default = field.default.as_ref().map(|d| d == "true").unwrap_or(false);
                let value = Confirm::new(&prompt_text)
                    .default(default)
                    .interact()
                    .await?;
                Ok(json!(value))
            }
            FieldType::Select(options) => {
                let value = Select::new(&prompt_text, options.clone())
                    .interact()
                    .await?;
                Ok(json!(value))
            }
            FieldType::MultiSelect(options) => {
                let value = crate::prompt::MultiSelect::new(&prompt_text, options.clone())
                    .interact()
                    .await?;
                Ok(json!(value))
            }
            _ => Err(Error::UnsupportedTerminal("Field type not implemented".to_string())),
        }
    }

    /// Get current data
    pub fn data(&self) -> &HashMap<String, serde_json::Value> {
        &self.data
    }

    /// Set initial data
    pub fn with_data(mut self, data: HashMap<String, serde_json::Value>) -> Self {
        self.data = data;
        self
    }
}

impl Default for Form {
    fn default() -> Self {
        Self::new()
    }
}

/// Wizard for guided multi-step workflows
pub struct Wizard {
    steps: Vec<WizardStep>,
    current: usize,
    data: HashMap<String, serde_json::Value>,
    theme: Theme,
}

#[derive(Clone)]
pub struct WizardStep {
    pub title: String,
    pub description: Option<String>,
    pub form: Form,
    pub on_complete: Option<Box<dyn Fn(&HashMap<String, serde_json::Value>) + Send + Sync>>,
}

impl Wizard {
    pub fn new() -> Self {
        Self {
            steps: Vec::new(),
            current: 0,
            data: HashMap::new(),
            theme: Theme::default(),
        }
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub fn add_step(mut self, step: WizardStep) -> Self {
        self.steps.push(step);
        self
    }

    pub async fn run(mut self) -> Result<HashMap<String, serde_json::Value>> {
        while self.current < self.steps.len() {
            let step = &mut self.steps[self.current];

            // Show progress
            let progress = format!("[Step {}/{}]", self.current + 1, self.steps.len());
            println!("\n{}", progress);

            // Run step form
            step.form = step.form.clone().with_data(self.data.clone());
            match step.form.interact().await {
                Ok(step_data) => {
                    self.data.extend(step_data);

                    // Call on_complete callback
                    if let Some(callback) = &step.on_complete {
                        callback(&self.data);
                    }

                    self.current += 1;
                }
                Err(Error::Cancelled) if self.current > 0 => {
                    // Go back on cancel
                    self.current -= 1;
                }
                Err(e) => return Err(e),
            }
        }

        Ok(self.data)
    }
}

impl Default for Wizard {
    fn default() -> Self {
        Self::new()
    }
}

impl WizardStep {
    pub fn new(title: impl Into<String>, form: Form) -> Self {
        Self {
            title: title.into(),
            description: None,
            form,
            on_complete: None,
        }
    }

    pub fn with_description(mut self, desc: impl Into<String>) -> Self {
        self.description = Some(desc.into());
        self
    }

    pub fn on_complete<F>(mut self, callback: F) -> Self
    where
        F: Fn(&HashMap<String, serde_json::Value>) + Send + Sync + 'static,
    {
        self.on_complete = Some(Box::new(callback));
        self
    }
}
