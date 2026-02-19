//! Workflow Templates
//!
//! Feature 4: Reusable workflow templates

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use crate::error::{Error, Result};
use crate::types::Action;

/// Workflow template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: Option<String>,
    pub tags: Vec<String>,
    pub steps: Vec<WorkflowStep>,
    pub variables: HashMap<String, VariableDefinition>,
    pub triggers: Vec<Trigger>,
}

/// A single workflow step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub name: String,
    pub action: Action,
    pub params: HashMap<String, String>,
    pub condition: Option<String>,
    pub on_failure: Option<FailureAction>,
    pub timeout_ms: Option<u64>,
}

/// Variable definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariableDefinition {
    pub name: String,
    pub var_type: VariableType,
    pub default: Option<String>,
    pub required: bool,
    pub description: String,
}

/// Variable types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum VariableType {
    String,
    Number,
    Boolean,
    Path,
    Selector,
}

/// Failure action
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FailureAction {
    Skip,
    Retry { max_attempts: u32 },
    Stop,
    Goto { step_id: String },
}

/// Trigger for workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trigger {
    pub trigger_type: TriggerType,
    pub enabled: bool,
}

/// Trigger types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TriggerType {
    Manual,
    Schedule { cron: String },
    Event { event_name: String },
    Webhook { path: String },
}

/// Workflow execution context
#[derive(Debug, Clone)]
pub struct WorkflowContext {
    pub variables: HashMap<String, String>,
    pub current_step: usize,
    pub executed_steps: Vec<String>,
    pub failed_steps: Vec<String>,
}

/// Workflow template manager
pub struct TemplateManager {
    templates_dir: PathBuf,
    templates: HashMap<String, WorkflowTemplate>,
}

impl TemplateManager {
    /// Create new template manager
    pub fn new(templates_dir: impl AsRef<Path>) -> Self {
        Self {
            templates_dir: templates_dir.as_ref().to_path_buf(),
            templates: HashMap::new(),
        }
    }

    /// Create with default directory
    pub fn default_dir() -> Self {
        Self::new("templates")
    }

    /// Load all templates
    pub fn load_all(&mut self) -> Result<()> {
        if !self.templates_dir.exists() {
            return Ok(());
        }

        for entry in std::fs::read_dir(&self.templates_dir)
            .map_err(|e| Error::Internal(e.to_string()))?
        {
            let entry = entry.map_err(|e| Error::Internal(e.to_string()))?;
            if entry.path().extension().map(|e| e == "json").unwrap_or(false) {
                if let Ok(template) = self.load_template(&entry.path()) {
                    self.templates.insert(template.id.clone(), template);
                }
            }
        }

        Ok(())
    }

    /// Load single template
    fn load_template(&self, path: &Path) -> Result<WorkflowTemplate> {
        let json = std::fs::read_to_string(path)
            .map_err(|e| Error::Internal(format!("Failed to load template: {}", e)))?;

        serde_json::from_str(&json)
            .map_err(|e| Error::Internal(e.to_string()))
    }

    /// Save template
    pub fn save(&self, template: &WorkflowTemplate) -> Result<()> {
        std::fs::create_dir_all(&self.templates_dir)
            .map_err(|e| Error::Internal(e.to_string()))?;

        let path = self.templates_dir.join(format!("{}.json", template.id));
        let json = serde_json::to_string_pretty(template)
            .map_err(|e| Error::Internal(e.to_string()))?;

        std::fs::write(path, json)
            .map_err(|e| Error::Internal(e.to_string()))
    }

    /// Get template by ID
    pub fn get(&self, id: &str) -> Option<&WorkflowTemplate> {
        self.templates.get(id)
    }

    /// List all templates
    pub fn list(&self) -> Vec<&WorkflowTemplate> {
        self.templates.values().collect()
    }

    /// Create workflow from template
    pub fn create_workflow(&self, template_id: &str, variables: HashMap<String, String>) -> Result<WorkflowContext> {
        let template = self.templates.get(template_id)
            .ok_or_else(|| Error::Internal(format!("Template not found: {}", template_id)))?;

        // Validate required variables
        for (name, def) in &template.variables {
            if def.required && !variables.contains_key(name) && def.default.is_none() {
                return Err(Error::Internal(format!("Missing required variable: {}", name)));
            }
        }

        // Merge with defaults
        let mut final_vars = variables;
        for (name, def) in &template.variables {
            if !final_vars.contains_key(name) {
                if let Some(default) = &def.default {
                    final_vars.insert(name.clone(), default.clone());
                }
            }
        }

        Ok(WorkflowContext {
            variables: final_vars,
            current_step: 0,
            executed_steps: Vec::new(),
            failed_steps: Vec::new(),
        })
    }

    /// Delete template
    pub fn delete(&mut self, id: &str) -> Result<()> {
        let path = self.templates_dir.join(format!("{}.json", id));
        if path.exists() {
            std::fs::remove_file(path)
                .map_err(|e| Error::Internal(e.to_string()))?;
        }
        self.templates.remove(id);
        Ok(())
    }
}

/// Built-in templates
pub fn builtin_templates() -> Vec<WorkflowTemplate> {
    vec![
        WorkflowTemplate {
            id: "open-browser".to_string(),
            name: "Open Browser".to_string(),
            description: "Open a browser and navigate to a URL".to_string(),
            version: "1.0.0".to_string(),
            author: None,
            tags: vec!["browser".to_string()],
            steps: vec![
                WorkflowStep {
                    id: "launch".to_string(),
                    name: "Launch Browser".to_string(),
                    action: Action::Launch,
                    params: [("path", "{{browser_path}}")].iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
                    condition: None,
                    on_failure: Some(FailureAction::Stop),
                    timeout_ms: Some(5000),
                },
            ],
            variables: [("browser_path", VariableDefinition {
                name: "browser_path".to_string(),
                var_type: VariableType::Path,
                default: Some("chrome".to_string()),
                required: false,
                description: "Path to browser executable".to_string(),
            })].iter().cloned().collect(),
            triggers: vec![Trigger {
                trigger_type: TriggerType::Manual,
                enabled: true,
            }],
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builtin_templates() {
        let templates = builtin_templates();
        assert!(!templates.is_empty());
    }

    #[test]
    fn test_template_manager() {
        let manager = TemplateManager::default_dir();
        let templates = manager.list();
        assert!(templates.is_empty());
    }
}
