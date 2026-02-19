use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateVariable {
    pub name: String,
    pub default_value: Option<String>,
    pub required: bool,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplatePattern {
    pub pattern: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceTemplate {
    pub name: String,
    pub description: Option<String>,
    pub pattern: TemplatePattern,
    pub variables: Vec<TemplateVariable>,
    pub examples: Vec<String>,
}

impl ResourceTemplate {
    pub fn new(name: String, pattern: String) -> Self {
        Self {
            name,
            description: None,
            pattern: TemplatePattern {
                pattern,
                description: None,
            },
            variables: Vec::new(),
            examples: Vec::new(),
        }
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }

    pub fn with_variable(mut self, variable: TemplateVariable) -> Self {
        self.variables.push(variable);
        self
    }

    pub fn with_example(mut self, example: String) -> Self {
        self.examples.push(example);
        self
    }

    pub fn render(&self, values: &HashMap<String, String>) -> Result<String, String> {
        let mut result = self.pattern.pattern.clone();

        for variable in &self.variables {
            let value = values.get(&variable.name)
                .or(variable.default_value.as_ref())
                .ok_or_else(|| format!("Missing required variable: {}", variable.name))?;

            result = result.replace(&format!("{{{{{}}}}}", variable.name), value);
        }

        Ok(result)
    }

    pub fn validate(&self, values: &HashMap<String, String>) -> Result<(), String> {
        for variable in &self.variables {
            if variable.required && !values.contains_key(&variable.name) {
                return Err(format!("Missing required variable: {}", variable.name));
            }
        }
        Ok(())
    }
}
