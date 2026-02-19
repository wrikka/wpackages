/// Form field types
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FormFieldType {
    Text,
    Password,
    Email,
    Number,
    Textarea,
    Checkbox,
    Select,
    Radio,
    Date,
    Time,
    Color,
    File,
}

/// Form field configuration
#[derive(Debug, Clone)]
pub struct FormField {
    pub name: String,
    pub label: String,
    pub field_type: FormFieldType,
    pub required: bool,
    pub placeholder: Option<String>,
    pub default_value: Option<String>,
    pub options: Option<Vec<String>>,
    pub validation: Option<super::form_validation::FormValidation>,
}

impl FormField {
    pub fn new(name: impl Into<String>, label: impl Into<String>, field_type: FormFieldType) -> Self {
        Self {
            name: name.into(),
            label: label.into(),
            field_type,
            required: false,
            placeholder: None,
            default_value: None,
            options: None,
            validation: None,
        }
    }

    pub fn required(mut self) -> Self {
        self.required = true;
        self
    }

    pub fn with_placeholder(mut self, placeholder: impl Into<String>) -> Self {
        self.placeholder = Some(placeholder.into());
        self
    }

    pub fn with_default(mut self, value: impl Into<String>) -> Self {
        self.default_value = Some(value.into());
        self
    }

    pub fn with_options(mut self, options: Vec<String>) -> Self {
        self.options = Some(options);
        self
    }

    pub fn with_validation(mut self, validation: super::form_validation::FormValidation) -> Self {
        self.validation = Some(validation);
        self
    }
}

/// Form validation error
#[derive(Debug, Clone)]
pub struct FormError {
    pub field_name: String,
    pub message: String,
}

impl FormError {
    pub fn new(field_name: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            field_name: field_name.into(),
            message: message.into(),
        }
    }
}
