use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[cfg(test)]
mod theme_variables_tests;

/// Theme variable type
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ThemeVariableType {
    Color,
    Spacing,
    Typography,
    Border,
    Radius,
    Shadow,
    Transition,
}

impl ThemeVariableType {
    pub fn as_str(&self) -> &str {
        match self {
            ThemeVariableType::Color => "color",
            ThemeVariableType::Spacing => "spacing",
            ThemeVariableType::Typography => "typography",
            ThemeVariableType::Border => "border",
            ThemeVariableType::Radius => "radius",
            ThemeVariableType::Shadow => "shadow",
            ThemeVariableType::Transition => "transition",
        }
    }
}

/// Theme variable value
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ThemeVariableValue {
    Color(String),
    Spacing(f32),
    Typography(TypographyValue),
    Border(f32),
    Radius(f32),
    Shadow(String),
    Transition(f32),
}

/// Typography value
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypographyValue {
    pub font_family: String,
    pub font_size: f32,
    pub font_weight: u32,
    pub line_height: f32,
    pub letter_spacing: f32,
}

impl Default for TypographyValue {
    fn default() -> Self {
        Self {
            font_family: "Inter".to_string(),
            font_size: 14.0,
            font_weight: 400,
            line_height: 1.5,
            letter_spacing: 0.0,
        }
    }
}

/// Theme variable
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeVariable {
    pub name: String,
    pub value: ThemeVariableValue,
    pub variable_type: ThemeVariableType,
    pub description: Option<String>,
}

impl ThemeVariable {
    pub fn new(name: impl Into<String>, value: ThemeVariableValue, variable_type: ThemeVariableType) -> Self {
        Self {
            name: name.into(),
            value,
            variable_type,
            description: None,
        }
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn css_variable_name(&self) -> String {
        format!("--rsui-{}", self.name.replace('_', "-"))
    }

    pub fn css_value(&self) -> String {
        match &self.value {
            ThemeVariableValue::Color(c) => c.clone(),
            ThemeVariableValue::Spacing(s) => format!("{}px", s),
            ThemeVariableValue::Typography(t) => {
                format!(
                    "{} {}px {} {} {}px",
                    t.font_family, t.font_size, t.font_weight, t.line_height, t.letter_spacing
                )
            }
            ThemeVariableValue::Border(b) => format!("{}px", b),
            ThemeVariableValue::Radius(r) => format!("{}px", r),
            ThemeVariableValue::Shadow(s) => s.clone(),
            ThemeVariableValue::Transition(t) => format!("{}ms", t),
        }
    }
}

/// Theme variables collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeVariables {
    pub variables: HashMap<String, ThemeVariable>,
}

impl Default for ThemeVariables {
    fn default() -> Self {
        Self::new()
    }
}

impl ThemeVariables {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
        }
    }

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            variables: HashMap::with_capacity(capacity),
        }
    }

    pub fn insert(&mut self, variable: ThemeVariable) {
        self.variables.insert(variable.name.clone(), variable);
    }

    pub fn get(&self, name: &str) -> Option<&ThemeVariable> {
        self.variables.get(name)
    }

    pub fn get_mut(&mut self, name: &str) -> Option<&mut ThemeVariable> {
        self.variables.get_mut(name)
    }

    pub fn remove(&mut self, name: &str) -> Option<ThemeVariable> {
        self.variables.remove(name)
    }

    pub fn clear(&mut self) {
        self.variables.clear();
    }

    pub fn len(&self) -> usize {
        self.variables.len()
    }

    pub fn is_empty(&self) -> bool {
        self.variables.is_empty()
    }

    pub fn iter(&self) -> impl Iterator<Item = (&String, &ThemeVariable)> {
        self.variables.iter()
    }

    pub fn by_type(&self, variable_type: ThemeVariableType) -> Vec<&ThemeVariable> {
        self.variables
            .values()
            .filter(|v| v.variable_type == variable_type)
            .collect()
    }

    pub fn to_css(&self) -> String {
        let mut css = String::new();
        css.push_str(":root {\n");
        
        for variable in self.variables.values() {
            css.push_str(&format!(
                "  {}: {};\n",
                variable.css_variable_name(),
                variable.css_value()
            ));
        }
        
        css.push_str("}\n");
        css
    }

    pub fn merge(&mut self, other: ThemeVariables) {
        for (name, variable) in other.variables {
            self.variables.insert(name, variable);
        }
    }
}

/// Create default theme variables
pub fn default_theme_variables() -> ThemeVariables {
    let mut variables = ThemeVariables::with_capacity(20);

    // Colors
    variables.insert(ThemeVariable::new(
        "primary",
        ThemeVariableValue::Color("#3b82f6".to_string()),
        ThemeVariableType::Color,
    ).with_description("Primary color"));

    variables.insert(ThemeVariable::new(
        "secondary",
        ThemeVariableValue::Color("#64748b".to_string()),
        ThemeVariableType::Color,
    ).with_description("Secondary color"));

    variables.insert(ThemeVariable::new(
        "accent",
        ThemeVariableValue::Color("#8b5cf6".to_string()),
        ThemeVariableType::Color,
    ).with_description("Accent color"));

    variables.insert(ThemeVariable::new(
        "foreground",
        ThemeVariableValue::Color("#0f172a".to_string()),
        ThemeVariableType::Color,
    ).with_description("Foreground text color"));

    variables.insert(ThemeVariable::new(
        "background",
        ThemeVariableValue::Color("#ffffff".to_string()),
        ThemeVariableType::Color,
    ).with_description("Background color"));

    // Spacing
    variables.insert(ThemeVariable::new(
        "spacing-xs",
        ThemeVariableValue::Spacing(4.0),
        ThemeVariableType::Spacing,
    ).with_description("Extra small spacing"));

    variables.insert(ThemeVariable::new(
        "spacing-sm",
        ThemeVariableValue::Spacing(8.0),
        ThemeVariableType::Spacing,
    ).with_description("Small spacing"));

    variables.insert(ThemeVariable::new(
        "spacing-md",
        ThemeVariableValue::Spacing(16.0),
        ThemeVariableType::Spacing,
    ).with_description("Medium spacing"));

    variables.insert(ThemeVariable::new(
        "spacing-lg",
        ThemeVariableValue::Spacing(24.0),
        ThemeVariableType::Spacing,
    ).with_description("Large spacing"));

    variables.insert(ThemeVariable::new(
        "spacing-xl",
        ThemeVariableValue::Spacing(32.0),
        ThemeVariableType::Spacing,
    ).with_description("Extra large spacing"));

    // Border radius
    variables.insert(ThemeVariable::new(
        "radius-sm",
        ThemeVariableValue::Radius(4.0),
        ThemeVariableType::Radius,
    ).with_description("Small border radius"));

    variables.insert(ThemeVariable::new(
        "radius-md",
        ThemeVariableValue::Radius(8.0),
        ThemeVariableType::Radius,
    ).with_description("Medium border radius"));

    variables.insert(ThemeVariable::new(
        "radius-lg",
        ThemeVariableValue::Radius(12.0),
        ThemeVariableType::Radius,
    ).with_description("Large border radius"));

    variables
}
