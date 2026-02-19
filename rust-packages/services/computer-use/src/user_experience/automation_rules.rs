//! Feature 38: Customizable Automation Rules

use crate::types::*;

/// Feature 38: Customizable Automation Rules
#[derive(Default)]
pub struct AutomationRules {
    rules: Vec<Rule>,
}

impl AutomationRules {
    /// Define custom automation rules
    pub fn define_rule(&mut self, rule: Rule) {
        self.rules.push(rule);
    }

    /// Create reusable workflows
    pub fn create_workflow(&self, actions: Vec<Action>) -> Workflow {
        Workflow {
            actions,
            id: uuid::Uuid::new_v4().to_string(),
        }
    }

    /// Share templates
    pub fn share_template(&self, workflow: &Workflow) -> Template {
        Template {
            id: workflow.id.clone(),
            actions: workflow.actions.clone(),
        }
    }
}
