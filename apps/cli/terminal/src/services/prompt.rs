use anyhow::Result;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::types::ShellType;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptTemplate {
    pub id: Uuid,
    pub name: String,
    pub template: String,
    pub variables: Vec<PromptVariable>,
    pub shell_type: Option<ShellType>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptVariable {
    pub name: String,
    pub default_value: String,
    pub description: String,
}

pub struct PromptGenerator {
    templates: Arc<RwLock<HashMap<Uuid, PromptTemplate>>>,
    variables: Arc<RwLock<HashMap<String, String>>>,
}

impl PromptGenerator {
    pub fn new() -> Self {
        Self {
            templates: Arc::new(RwLock::new(HashMap::new())),
            variables: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn add_template(&self, template: PromptTemplate) {
        self.templates.write().insert(template.id, template);
    }

    pub fn remove_template(&self, template_id: Uuid) {
        self.templates.write().remove(&template_id);
    }

    pub fn get_template(&self, template_id: Uuid) -> Option<PromptTemplate> {
        self.templates.read().get(&template_id).cloned()
    }

    pub fn get_templates(&self) -> Vec<PromptTemplate> {
        self.templates.read().values().cloned().collect()
    }

    pub fn set_variable(&self, name: String, value: String) {
        self.variables.write().insert(name, value);
    }

    pub fn get_variable(&self, name: &str) -> Option<String> {
        self.variables.read().get(name).cloned()
    }

    pub fn generate(&self, template_id: Uuid, context: &HashMap<String, String>) -> Result<String> {
        let template = self
            .get_template(template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found"))?;

        let mut prompt = template.template.clone();

        for var in &template.variables {
            let value = context
                .get(&var.name)
                .or_else(|| self.get_variable(&var.name))
                .unwrap_or(&var.default_value)
                .clone();

            prompt = prompt.replace(&format!("{{{{{}}}}}", var.name), &value);
        }

        Ok(prompt)
    }

    pub fn generate_default(
        &self,
        shell_type: ShellType,
        context: &HashMap<String, String>,
    ) -> Result<String> {
        let template = self
            .templates
            .read()
            .values()
            .find(|t| t.enabled && t.shell_type.as_ref().map_or(true, |st| st == &shell_type))
            .cloned();

        if let Some(template) = template {
            self.generate(template.id, context)
        } else {
            Ok(shell_type.default_prompt())
        }
    }
}

impl Default for PromptGenerator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_prompt_generator() {
        let generator = PromptGenerator::new();

        let template = PromptTemplate {
            id: Uuid::new_v4(),
            name: "Custom Prompt".to_string(),
            template: "{{user}}@{{host}}:{{dir}}$ ".to_string(),
            variables: vec![
                PromptVariable {
                    name: "user".to_string(),
                    default_value: "user".to_string(),
                    description: "Username".to_string(),
                },
                PromptVariable {
                    name: "host".to_string(),
                    default_value: "localhost".to_string(),
                    description: "Hostname".to_string(),
                },
                PromptVariable {
                    name: "dir".to_string(),
                    default_value: "~".to_string(),
                    description: "Directory".to_string(),
                },
            ],
            shell_type: None,
            enabled: true,
        };

        generator.add_template(template);

        let mut context = HashMap::new();
        context.insert("user".to_string(), "alice".to_string());
        context.insert("host".to_string(), "server".to_string());
        context.insert("dir".to_string(), "/home/alice".to_string());

        let prompt = generator.generate(template.id, &context).unwrap();
        assert_eq!(prompt, "alice@server:/home/alice$ ");
    }
}
