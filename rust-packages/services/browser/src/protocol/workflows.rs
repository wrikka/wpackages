use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::protocol::{Action, Params};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Condition {
    ElementExists { selector: String },
    ElementVisible { selector: String },
    TextContains { selector: String, text: String },
    UrlContains { text: String },
    TitleContains { text: String },
    Custom { script: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionalBranch {
    pub condition: Condition,
    pub then_steps: Vec<WorkflowStep>,
    pub else_steps: Option<Vec<WorkflowStep>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub backoff_ms: u64,
    pub backoff_multiplier: f64,
    pub max_backoff_ms: u64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            backoff_ms: 1000,
            backoff_multiplier: 2.0,
            max_backoff_ms: 30000,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WorkflowStep {
    Action {
        action: Action,
        params: Params,
        #[serde(skip_serializing_if = "Option::is_none")]
        retry: Option<RetryConfig>,
    },
    Wait {
        duration_ms: u64,
        #[serde(skip_serializing_if = "Option::is_none")]
        condition: Option<Condition>,
    },
    Conditional(ConditionalBranch),
    Loop {
        condition: Condition,
        steps: Vec<WorkflowStep>,
        max_iterations: u32,
    },
    Extract {
        variable_name: String,
        selector: String,
        attribute: Option<String>,
    },
    Validate {
        condition: Condition,
        error_message: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub name: String,
    pub description: Option<String>,
    pub steps: Vec<WorkflowStep>,
    pub variables: HashMap<String, String>,
    pub on_error: Option<ErrorHandler>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorHandler {
    pub action: ErrorAction,
    pub notification: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ErrorAction {
    Stop,
    Continue,
    Retry { attempts: u32 },
    Fallback { steps: Vec<WorkflowStep> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowResult {
    pub success: bool,
    pub step_results: Vec<StepResult>,
    pub variables: HashMap<String, String>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepResult {
    pub step_index: usize,
    pub step_type: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

impl Workflow {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: None,
            steps: Vec::new(),
            variables: HashMap::new(),
            on_error: None,
        }
    }

    pub fn with_description(mut self, desc: impl Into<String>) -> Self {
        self.description = Some(desc.into());
        self
    }

    pub fn add_step(mut self, step: WorkflowStep) -> Self {
        self.steps.push(step);
        self
    }

    pub fn add_action(self, action: Action, params: Params) -> Self {
        self.add_step(WorkflowStep::Action {
            action,
            params,
            retry: None,
        })
    }

    pub fn add_wait(self, duration_ms: u64) -> Self {
        self.add_step(WorkflowStep::Wait {
            duration_ms,
            condition: None,
        })
    }

    pub fn add_conditional(
        self,
        condition: Condition,
        then_steps: Vec<WorkflowStep>,
        else_steps: Option<Vec<WorkflowStep>>,
    ) -> Self {
        self.add_step(WorkflowStep::Conditional(ConditionalBranch {
            condition,
            then_steps,
            else_steps,
        }))
    }

    pub fn set_variable(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.variables.insert(key.into(), value.into());
        self
    }

    pub fn save_to_file(&self, path: &str) -> crate::error::Result<()> {
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| crate::error::Error::Serialization(e.to_string()))?;
        std::fs::write(path, json)
            .map_err(|e| crate::error::Error::Io(e.to_string()))?;
        Ok(())
    }

    pub fn load_from_file(path: &str) -> crate::error::Result<Self> {
        let json = std::fs::read_to_string(path)
            .map_err(|e| crate::error::Error::Io(e.to_string()))?;
        let workflow: Workflow = serde_json::from_str(&json)
            .map_err(|e| crate::error::Error::Serialization(e.to_string()))?;
        Ok(workflow)
    }
}
