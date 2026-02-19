//! Types for workflow engine

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A workflow definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub steps: Vec<WorkflowStep>,
    pub variables: HashMap<String, String>,
    pub on_error: Option<ErrorHandler>,
    pub metadata: WorkflowMetadata,
}

impl Workflow {
    /// Create a new workflow
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            description: None,
            steps: Vec::new(),
            variables: HashMap::new(),
            on_error: None,
            metadata: WorkflowMetadata::default(),
        }
    }

    /// Add a step to the workflow
    pub fn add_step(mut self, step: WorkflowStep) -> Self {
        self.steps.push(step);
        self
    }

    /// Set error handler
    pub fn on_error(mut self, handler: ErrorHandler) -> Self {
        self.on_error = Some(handler);
        self
    }

    /// Set initial variables
    pub fn with_variables(mut self, variables: HashMap<String, String>) -> Self {
        self.variables = variables;
        self
    }

    /// Set description
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkflowMetadata {
    pub author: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub tags: Vec<String>,
    pub category: Option<String>,
}

/// A single step in a workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WorkflowStep {
    /// Execute an action
    Action {
        action: String,
        params: serde_json::Value,
        retry: Option<RetryConfig>,
    },
    /// Wait for a duration or condition
    Wait {
        duration_ms: u64,
        condition: Option<Condition>,
    },
    /// Conditional branch
    Conditional(ConditionalBranch),
    /// Loop with condition
    Loop {
        condition: Condition,
        steps: Vec<WorkflowStep>,
        max_iterations: usize,
    },
    /// Extract a value to a variable
    Extract {
        variable_name: String,
        selector: String,
        attribute: Option<String>,
    },
    /// Validate a condition
    Validate {
        condition: Condition,
        error_message: String,
    },
}

impl WorkflowStep {
    /// Create an action step
    pub fn action(action: impl Into<String>, params: impl Serialize) -> Self {
        Self::Action {
            action: action.into(),
            params: serde_json::to_value(params).unwrap_or_default(),
            retry: None,
        }
    }

    /// Create an action step with retry
    pub fn action_with_retry(
        action: impl Into<String>,
        params: impl Serialize,
        retry: RetryConfig,
    ) -> Self {
        Self::Action {
            action: action.into(),
            params: serde_json::to_value(params).unwrap_or_default(),
            retry: Some(retry),
        }
    }

    /// Create a wait step
    pub fn wait(duration_ms: u64) -> Self {
        Self::Wait {
            duration_ms,
            condition: None,
        }
    }

    /// Create a wait step with condition
    pub fn wait_for(duration_ms: u64, condition: Condition) -> Self {
        Self::Wait {
            duration_ms,
            condition: Some(condition),
        }
    }

    /// Create a conditional branch
    pub fn conditional(
        condition: Condition,
        then_steps: Vec<WorkflowStep>,
        else_steps: Option<Vec<WorkflowStep>>,
    ) -> Self {
        Self::Conditional(ConditionalBranch {
            condition,
            then_steps,
            else_steps,
        })
    }

    /// Create a loop step
    pub fn loop_while(
        condition: Condition,
        steps: Vec<WorkflowStep>,
        max_iterations: usize,
    ) -> Self {
        Self::Loop {
            condition,
            steps,
            max_iterations,
        }
    }

    /// Create an extraction step
    pub fn extract(variable_name: impl Into<String>, selector: impl Into<String>) -> Self {
        Self::Extract {
            variable_name: variable_name.into(),
            selector: selector.into(),
            attribute: None,
        }
    }

    /// Create an extraction step with attribute
    pub fn extract_attribute(
        variable_name: impl Into<String>,
        selector: impl Into<String>,
        attribute: impl Into<String>,
    ) -> Self {
        Self::Extract {
            variable_name: variable_name.into(),
            selector: selector.into(),
            attribute: Some(attribute.into()),
        }
    }

    /// Create a validation step
    pub fn validate(condition: Condition, error_message: impl Into<String>) -> Self {
        Self::Validate {
            condition,
            error_message: error_message.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionalBranch {
    pub condition: Condition,
    pub then_steps: Vec<WorkflowStep>,
    pub else_steps: Option<Vec<WorkflowStep>>,
}

/// Condition for conditional execution
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Condition {
    ElementExists { selector: String },
    ElementVisible { selector: String },
    TextContains { selector: String, text: String },
    UrlContains { text: String },
    TitleContains { text: String },
    Custom { script: String },
    VariableEquals { name: String, value: String },
}

impl Condition {
    pub fn element_exists(selector: impl Into<String>) -> Self {
        Self::ElementExists {
            selector: selector.into(),
        }
    }

    pub fn element_visible(selector: impl Into<String>) -> Self {
        Self::ElementVisible {
            selector: selector.into(),
        }
    }

    pub fn text_contains(selector: impl Into<String>, text: impl Into<String>) -> Self {
        Self::TextContains {
            selector: selector.into(),
            text: text.into(),
        }
    }

    pub fn url_contains(text: impl Into<String>) -> Self {
        Self::UrlContains { text: text.into() }
    }

    pub fn title_contains(text: impl Into<String>) -> Self {
        Self::TitleContains { text: text.into() }
    }

    pub fn custom(script: impl Into<String>) -> Self {
        Self::Custom { script: script.into() }
    }

    pub fn variable_equals(name: impl Into<String>, value: impl Into<String>) -> Self {
        Self::VariableEquals {
            name: name.into(),
            value: value.into(),
        }
    }
}

/// Retry configuration
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

impl RetryConfig {
    pub fn new(max_attempts: u32) -> Self {
        Self {
            max_attempts,
            ..Default::default()
        }
    }

    pub fn with_backoff(mut self, initial_ms: u64, multiplier: f64, max_ms: u64) -> Self {
        self.backoff_ms = initial_ms;
        self.backoff_multiplier = multiplier;
        self.max_backoff_ms = max_ms;
        self
    }
}

/// Error handler configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorHandler {
    pub action: ErrorAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ErrorAction {
    Stop,
    Continue,
    Retry { attempts: u32 },
    Fallback { steps: Vec<WorkflowStep> },
}

/// Result of a workflow execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowResult {
    pub success: bool,
    pub step_results: Vec<StepResult>,
    pub variables: HashMap<String, String>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

/// Result of a single step execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepResult {
    pub step_index: usize,
    pub step_type: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

/// Execution context passed during workflow execution
#[derive(Debug, Clone)]
pub struct ExecutionContext {
    pub workflow_id: String,
    pub session_id: String,
    pub variables: HashMap<String, String>,
    pub start_time: std::time::Instant,
}

impl ExecutionContext {
    pub fn new(workflow_id: String, session_id: String) -> Self {
        Self {
            workflow_id,
            session_id,
            variables: HashMap::new(),
            start_time: std::time::Instant::now(),
        }
    }

    pub fn with_variables(mut self, variables: HashMap<String, String>) -> Self {
        self.variables = variables;
        self
    }

    pub fn get_variable(&self, name: &str) -> Option<&String> {
        self.variables.get(name)
    }

    pub fn set_variable(&mut self, name: String, value: String) {
        self.variables.insert(name, value);
    }

    pub fn elapsed_ms(&self) -> u64 {
        self.start_time.elapsed().as_millis() as u64
    }
}
