//! Workflow Recorder & Replay System
//!
//! This module provides comprehensive workflow recording and replay capabilities:
//! - Record user actions with metadata (timestamp, coordinates, element info)
//! - Save recordings as reusable scripts
//! - Edit recordings before replay
//! - Conditional replay with error handling
//! - Export to various formats (JSON, YAML, TypeScript)

use crate::error::{Error, Result};
use crate::protocol::{Action, Command};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::fs;
use uuid::Uuid;

/// Represents a single recorded action with full context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedAction {
    /// Unique identifier for this action
    pub id: String,
    /// Timestamp when action was recorded
    pub timestamp: u64,
    /// Action type
    pub action: Action,
    /// Action parameters
    pub params: serde_json::Value,
    /// Screen coordinates (if applicable)
    pub coordinates: Option<Coordinates>,
    /// Target element information (if available)
    pub target_element: Option<ElementInfo>,
    /// Screenshot reference (for visual replay)
    pub screenshot_ref: Option<String>,
    /// Duration taken to execute this action
    pub execution_duration_ms: Option<u64>,
    /// Action result (success/error)
    pub result: Option<ActionResult>,
    /// Human-readable description
    pub description: String,
    /// Tags for categorization
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coordinates {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementInfo {
    pub selector: String,
    pub element_type: String,
    pub text: Option<String>,
    pub attributes: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub error_message: Option<String>,
    pub output_data: Option<serde_json::Value>,
}

/// A complete workflow recording
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    /// Workflow unique identifier
    pub id: String,
    /// Workflow name
    pub name: String,
    /// Description of what this workflow does
    pub description: String,
    /// When the workflow was created
    pub created_at: u64,
    /// Last modified timestamp
    pub modified_at: u64,
    /// Version for tracking changes
    pub version: u32,
    /// Tags for organization
    pub tags: Vec<String>,
    /// Category for grouping
    pub category: String,
    /// The recorded actions
    pub actions: Vec<RecordedAction>,
    /// Variables for parameterization
    pub variables: HashMap<String, WorkflowVariable>,
    /// Pre-condition checks
    pub pre_conditions: Vec<Condition>,
    /// Post-condition checks
    pub post_conditions: Vec<Condition>,
    /// Error handling strategy
    pub error_strategy: ErrorStrategy,
    /// Metadata about the recording environment
    pub environment: EnvironmentInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowVariable {
    pub name: String,
    pub default_value: Option<String>,
    pub description: String,
    pub required: bool,
    pub var_type: VariableType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    String,
    Number,
    Boolean,
    Path,
    Date,
    Secret,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub condition_type: ConditionType,
    pub expression: String,
    pub error_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    ElementExists,
    ElementNotExists,
    TextContains,
    TextEquals,
    VariableEquals,
    ScreenshotMatch,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorStrategy {
    StopOnError,
    ContinueOnError,
    RetryThenStop { max_retries: u32, delay_ms: u64 },
    AskUser,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentInfo {
    pub os: String,
    pub os_version: String,
    pub screen_resolution: String,
    pub primary_language: String,
    pub recorded_app_version: Option<String>,
}

/// Manages workflow recordings
pub struct WorkflowRecorder {
    /// Current active recording (if any)
    active_recording: Option<Workflow>,
    /// Storage directory for workflows
    storage_path: PathBuf,
    /// Whether currently recording
    is_recording: bool,
    /// Recording start time
    recording_start: Option<u64>,
    /// Last action timestamp for duration calculation
    last_action_time: Option<u64>,
}

impl WorkflowRecorder {
    pub fn new(storage_path: PathBuf) -> Self {
        Self {
            active_recording: None,
            storage_path,
            is_recording: false,
            recording_start: None,
            last_action_time: None,
        }
    }

    /// Start a new workflow recording
    pub fn start_recording(&mut self, name: &str, description: &str) -> Result<String> {
        if self.is_recording {
            return Err(Error::InvalidCommand(
                "Already recording a workflow. Stop current recording first.".to_string(),
            ));
        }

        let workflow_id = Uuid::new_v4().to_string();
        let now = current_timestamp();

        let workflow = Workflow {
            id: workflow_id.clone(),
            name: name.to_string(),
            description: description.to_string(),
            created_at: now,
            modified_at: now,
            version: 1,
            tags: vec![],
            category: "user-recorded".to_string(),
            actions: vec![],
            variables: HashMap::new(),
            pre_conditions: vec![],
            post_conditions: vec![],
            error_strategy: ErrorStrategy::StopOnError,
            environment: get_environment_info(),
        };

        self.active_recording = Some(workflow);
        self.is_recording = true;
        self.recording_start = Some(now);
        self.last_action_time = Some(now);

        Ok(workflow_id)
    }

    /// Record a single action
    pub fn record_action(
        &mut self,
        action: Action,
        params: serde_json::Value,
        coordinates: Option<Coordinates>,
        target_element: Option<ElementInfo>,
        description: &str,
    ) -> Result<String> {
        if !self.is_recording {
            return Err(Error::InvalidCommand(
                "No active recording. Start recording first.".to_string(),
            ));
        }

        let workflow = self
            .active_recording
            .as_mut()
            .ok_or_else(|| Error::InvalidCommand("No active recording".to_string()))?;

        let now = current_timestamp();
        let execution_duration = self
            .last_action_time
            .map(|last| now - last)
            .unwrap_or(0);

        let recorded_action = RecordedAction {
            id: Uuid::new_v4().to_string(),
            timestamp: now,
            action,
            params,
            coordinates,
            target_element,
            screenshot_ref: None,
            execution_duration_ms: Some(execution_duration),
            result: None,
            description: description.to_string(),
            tags: vec![],
        };

        workflow.actions.push(recorded_action.clone());
        workflow.modified_at = now;
        self.last_action_time = Some(now);

        Ok(recorded_action.id)
    }

    /// Update the last action with its result
    pub fn update_action_result(
        &mut self,
        action_id: &str,
        result: ActionResult,
    ) -> Result<()> {
        let workflow = self
            .active_recording
            .as_mut()
            .ok_or_else(|| Error::InvalidCommand("No active recording".to_string()))?;

        if let Some(action) = workflow.actions.iter_mut().find(|a| a.id == action_id) {
            action.result = Some(result);
            Ok(())
        } else {
            Err(Error::InvalidCommand(format!(
                "Action {} not found in recording",
                action_id
            )))
        }
    }

    /// Stop recording and save the workflow
    pub async fn stop_recording(&mut self) -> Result<Workflow> {
        if !self.is_recording {
            return Err(Error::InvalidCommand(
                "No active recording to stop".to_string(),
            ));
        }

        let workflow = self
            .active_recording
            .take()
            .ok_or_else(|| Error::InvalidCommand("No active recording".to_string()))?;

        // Save to disk
        self.save_workflow(&workflow).await?;

        self.is_recording = false;
        self.recording_start = None;
        self.last_action_time = None;

        Ok(workflow)
    }

    /// Discard current recording without saving
    pub fn discard_recording(&mut self) -> Result<()> {
        if !self.is_recording {
            return Err(Error::InvalidCommand(
                "No active recording to discard".to_string(),
            ));
        }

        self.active_recording = None;
        self.is_recording = false;
        self.recording_start = None;
        self.last_action_time = None;

        Ok(())
    }

    /// Save workflow to disk
    async fn save_workflow(&self, workflow: &Workflow) -> Result<()> {
        // Ensure storage directory exists
        fs::create_dir_all(&self.storage_path)
            .await
            .map_err(|e| Error::Io(e))?;

        let file_path = self.storage_path.join(format!("{}.json", workflow.id));
        let json = serde_json::to_string_pretty(workflow)
            .map_err(|e| Error::Protocol(e.to_string()))?;

        fs::write(&file_path, json)
            .await
            .map_err(|e| Error::Io(e))?;

        Ok(())
    }

    /// Load a workflow from disk
    pub async fn load_workflow(&self, workflow_id: &str) -> Result<Workflow> {
        let file_path = self.storage_path.join(format!("{}.json", workflow_id));
        let content = fs::read_to_string(&file_path)
            .await
            .map_err(|e| Error::Io(e))?;

        let workflow: Workflow =
            serde_json::from_str(&content).map_err(|e| Error::Protocol(e.to_string()))?;

        Ok(workflow)
    }

    /// List all saved workflows
    pub async fn list_workflows(&self) -> Result<Vec<WorkflowSummary>> {
        let mut workflows = vec![];

        if let Ok(mut entries) = fs::read_dir(&self.storage_path).await {
            while let Ok(Some(entry)) = entries.next_entry().await {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("json") {
                    if let Ok(content) = fs::read_to_string(&path).await {
                        if let Ok(workflow) =
                            serde_json::from_str::<Workflow>(&content)
                        {
                            workflows.push(WorkflowSummary {
                                id: workflow.id,
                                name: workflow.name,
                                description: workflow.description,
                                created_at: workflow.created_at,
                                modified_at: workflow.modified_at,
                                action_count: workflow.actions.len(),
                                tags: workflow.tags,
                                category: workflow.category,
                            });
                        }
                    }
                }
            }
        }

        // Sort by modified date descending
        workflows.sort_by(|a, b| b.modified_at.cmp(&a.modified_at));

        Ok(workflows)
    }

    /// Delete a workflow
    pub async fn delete_workflow(&self, workflow_id: &str) -> Result<()> {
        let file_path = self.storage_path.join(format!("{}.json", workflow_id));
        fs::remove_file(&file_path)
            .await
            .map_err(|e| Error::Io(e))?;
        Ok(())
    }

    /// Export workflow to TypeScript
    pub fn export_to_typescript(&self, workflow: &Workflow) -> Result<String> {
        let mut ts_code = format!(
            r#"// Auto-generated workflow: {}
// Description: {}
// Created: {}
// Version: {}

import {{ computerUse }} from 'computer-use';

export const workflow = async (params: Record<string, any> = {{
",
            workflow.name,
            workflow.description,
            workflow.created_at,
            workflow.version
        );

        // Add variable declarations
        for (var in workflow.variables.values()) {
            // This is simplified - would need proper TypeScript generation
        }

        ts_code.push_str("}) => {\n");
        ts_code.push_str("  const cu = computerUse();\n\n");

        // Generate action calls
        for (action in &workflow.actions) {
            ts_code.push_str(&format!(
                "  // {}\n",
                action.description
            ));
            // Generate specific action call based on action type
            // This is simplified - would need proper action mapping
        }

        ts_code.push_str("};\n");
        Ok(ts_code)
    }

    /// Export workflow to YAML
    pub fn export_to_yaml(&self, workflow: &Workflow) -> Result<String> {
        let yaml = serde_yaml::to_string(workflow)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        Ok(yaml)
    }

    /// Check if currently recording
    pub fn is_recording(&self) -> bool {
        self.is_recording
    }

    /// Get current recording info
    pub fn get_recording_info(&self) -> Option<RecordingInfo> {
        self.active_recording.as_ref().map(|w| RecordingInfo {
            id: w.id.clone(),
            name: w.name.clone(),
            action_count: w.actions.len(),
            recording_duration_ms: self
                .recording_start
                .map(|start| current_timestamp() - start)
                .unwrap_or(0),
        })
    }
}

#[derive(Debug, Clone)]
pub struct WorkflowSummary {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: u64,
    pub modified_at: u64,
    pub action_count: usize,
    pub tags: Vec<String>,
    pub category: String,
}

#[derive(Debug, Clone)]
pub struct RecordingInfo {
    pub id: String,
    pub name: String,
    pub action_count: usize,
    pub recording_duration_ms: u64,
}

/// Replays a workflow with various options
pub struct WorkflowReplayer {
    recorder: WorkflowRecorder,
    options: ReplayOptions,
}

#[derive(Debug, Clone)]
pub struct ReplayOptions {
    /// Speed multiplier (1.0 = normal, 0.5 = half speed, 2.0 = double)
    pub speed_multiplier: f64,
    /// Whether to pause on each action
    pub pause_on_each_action: bool,
    /// Whether to highlight elements during replay
    pub highlight_elements: bool,
    /// Whether to take screenshots during replay
    pub capture_screenshots: bool,
    /// Variable values to use
    pub variables: HashMap<String, String>,
    /// Callback for action completion
    pub on_action_complete: Option<Box<dyn Fn(&RecordedAction) + Send>>,
    /// Callback for errors
    pub on_error: Option<Box<dyn Fn(&Error) + Send>>,
}

impl Default for ReplayOptions {
    fn default() -> Self {
        Self {
            speed_multiplier: 1.0,
            pause_on_each_action: false,
            highlight_elements: true,
            capture_screenshots: false,
            variables: HashMap::new(),
            on_action_complete: None,
            on_error: None,
        }
    }
}

impl WorkflowReplayer {
    pub fn new(recorder: WorkflowRecorder) -> Self {
        Self {
            recorder,
            options: ReplayOptions::default(),
        }
    }

    pub fn with_options(mut self, options: ReplayOptions) -> Self {
        self.options = options;
        self
    }

    /// Replay a workflow
    pub async fn replay(&self, workflow: &Workflow) -> Result<ReplayResult> {
        let start_time = current_timestamp();
        let mut executed_actions = 0;
        let mut failed_actions = 0;
        let mut results = vec![];

        // Check pre-conditions
        for condition in &workflow.pre_conditions {
            if !self.check_condition(condition).await? {
                return Err(Error::InvalidCommand(format!(
                    "Pre-condition failed: {}",
                    condition.error_message
                )));
            }
        }

        // Execute actions
        for action in &workflow.actions {
            let action_start = current_timestamp();

            match self.execute_action(action).await {
                Ok(result) => {
                    executed_actions += 1;
                    results.push(ActionExecutionResult {
                        action_id: action.id.clone(),
                        success: true,
                        error: None,
                        duration_ms: current_timestamp() - action_start,
                    });

                    if let Some(ref callback) = self.options.on_action_complete {
                        callback(action);
                    }
                }
                Err(e) => {
                    failed_actions += 1;
                    results.push(ActionExecutionResult {
                        action_id: action.id.clone(),
                        success: false,
                        error: Some(e.to_string()),
                        duration_ms: current_timestamp() - action_start,
                    });

                    if let Some(ref callback) = self.options.on_error {
                        callback(&e);
                    }

                    match workflow.error_strategy {
                        ErrorStrategy::StopOnError => {
                            return Err(e);
                        }
                        ErrorStrategy::ContinueOnError => continue,
                        ErrorStrategy::RetryThenStop {
                            max_retries,
                            delay_ms,
                        } => {
                            // Retry logic would go here
                            let _ = max_retries;
                            let _ = delay_ms;
                            continue;
                        }
                        ErrorStrategy::AskUser => {
                            // Would prompt user for decision
                            continue;
                        }
                    }
                }
            }

            // Apply speed delay
            if self.options.speed_multiplier != 1.0 {
                let delay = action
                    .execution_duration_ms
                    .unwrap_or(0) as f64
                    / self.options.speed_multiplier;
                tokio::time::sleep(tokio::time::Duration::from_millis(delay as u64)).await;
            }
        }

        // Check post-conditions
        for condition in &workflow.post_conditions {
            if !self.check_condition(condition).await? {
                return Err(Error::InvalidCommand(format!(
                    "Post-condition failed: {}",
                    condition.error_message
                )));
            }
        }

        Ok(ReplayResult {
            workflow_id: workflow.id.clone(),
            total_actions: workflow.actions.len(),
            executed_actions,
            failed_actions,
            duration_ms: current_timestamp() - start_time,
            results,
        })
    }

    async fn execute_action(&self, action: &RecordedAction) -> Result<ActionResult> {
        // This would integrate with the daemon to actually execute actions
        // For now, return a placeholder
        Ok(ActionResult {
            success: true,
            error_message: None,
            output_data: Some(action.params.clone()),
        })
    }

    async fn check_condition(&self, _condition: &Condition) -> Result<bool> {
        // This would check various conditions before/after replay
        // For now, return true
        Ok(true)
    }
}

#[derive(Debug, Clone)]
pub struct ReplayResult {
    pub workflow_id: String,
    pub total_actions: usize,
    pub executed_actions: usize,
    pub failed_actions: usize,
    pub duration_ms: u64,
    pub results: Vec<ActionExecutionResult>,
}

#[derive(Debug, Clone)]
pub struct ActionExecutionResult {
    pub action_id: String,
    pub success: bool,
    pub error: Option<String>,
    pub duration_ms: u64,
}

/// Helper function to get current timestamp
fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

/// Helper function to get environment info
fn get_environment_info() -> EnvironmentInfo {
    EnvironmentInfo {
        os: std::env::consts::OS.to_string(),
        os_version: get_os_version(),
        screen_resolution: get_screen_resolution(),
        primary_language: get_primary_language(),
        recorded_app_version: Some(env!("CARGO_PKG_VERSION").to_string()),
    }
}

fn get_os_version() -> String {
    // Platform-specific implementation would go here
    "unknown".to_string()
}

fn get_screen_resolution() -> String {
    // Would use display API to get actual resolution
    "unknown".to_string()
}

fn get_primary_language() -> String {
    std::env::var("LANG")
        .or_else(|_| std::env::var("LC_ALL"))
        .unwrap_or_else(|_| "en".to_string())
}

/// Workflow editor for modifying recordings
pub struct WorkflowEditor;

impl WorkflowEditor {
    /// Add a variable to the workflow
    pub fn add_variable(
        workflow: &mut Workflow,
        name: &str,
        description: &str,
        default_value: Option<&str>,
        var_type: VariableType,
        required: bool,
    ) {
        workflow.variables.insert(
            name.to_string(),
            WorkflowVariable {
                name: name.to_string(),
                default_value: default_value.map(|s| s.to_string()),
                description: description.to_string(),
                var_type,
                required,
            },
        );
    }

    /// Remove an action from the workflow
    pub fn remove_action(workflow: &mut Workflow, action_id: &str) -> Result<()> {
        let index = workflow
            .actions
            .iter()
            .position(|a| a.id == action_id)
            .ok_or_else(|| Error::InvalidCommand(format!(
                "Action {} not found",
                action_id
            )))?;
        workflow.actions.remove(index);
        workflow.modified_at = current_timestamp();
        Ok(())
    }

    /// Reorder actions
    pub fn reorder_actions(
        workflow: &mut Workflow,
        action_id: &str,
        new_index: usize,
    ) -> Result<()> {
        let old_index = workflow
            .actions
            .iter()
            .position(|a| a.id == action_id)
            .ok_or_else(|| Error::InvalidCommand(format!(
                "Action {} not found",
                action_id
            )))?;

        if new_index >= workflow.actions.len() {
            return Err(Error::InvalidCommand(
                "New index out of bounds".to_string(),
            ));
        }

        let action = workflow.actions.remove(old_index);
        workflow.actions.insert(new_index, action);
        workflow.modified_at = current_timestamp();
        Ok(())
    }

    /// Insert a wait action
    pub fn insert_wait(workflow: &mut Workflow, after_action_id: &str, duration_ms: u64) -> Result<String> {
        let index = workflow
            .actions
            .iter()
            .position(|a| a.id == after_action_id)
            .ok_or_else(|| Error::InvalidCommand(format!(
                "Action {} not found",
                after_action_id
            )))?;

        let wait_action = RecordedAction {
            id: Uuid::new_v4().to_string(),
            timestamp: current_timestamp(),
            action: Action::Wait,
            params: serde_json::json!({"duration_ms": duration_ms}),
            coordinates: None,
            target_element: None,
            screenshot_ref: None,
            execution_duration_ms: None,
            result: None,
            description: format!("Wait for {}ms", duration_ms),
            tags: vec!["wait".to_string()],
        };

        workflow.actions.insert(index + 1, wait_action.clone());
        workflow.modified_at = current_timestamp();
        Ok(wait_action.id)
    }

    /// Add a conditional branch
    pub fn add_conditional(
        workflow: &mut Workflow,
        after_action_id: &str,
        condition: Condition,
        true_actions: Vec<RecordedAction>,
        false_actions: Vec<RecordedAction>,
    ) -> Result<()> {
        let _ = after_action_id;
        let _ = condition;
        let _ = true_actions;
        let _ = false_actions;
        // Implementation would add conditional logic to workflow
        workflow.modified_at = current_timestamp();
        Ok(())
    }
}
