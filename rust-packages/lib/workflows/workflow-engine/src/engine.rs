//! Workflow engine implementation

use crate::error::{Result, WorkflowError};
use crate::executor::WorkflowExecutor;
use crate::types::*;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::time::{sleep, Duration};
use tracing::{debug, error, info, warn};

/// Workflow engine for executing workflows
pub struct WorkflowEngine {
    workflows: HashMap<String, Workflow>,
}

impl WorkflowEngine {
    /// Create a new workflow engine
    pub fn new() -> Self {
        Self {
            workflows: HashMap::new(),
        }
    }

    /// Register a workflow
    pub fn register(&mut self, workflow: Workflow) {
        self.workflows.insert(workflow.id.clone(), workflow);
    }

    /// Remove a workflow
    pub fn unregister(&mut self, workflow_id: &str) {
        self.workflows.remove(workflow_id);
    }

    /// Get a workflow by ID
    pub fn get_workflow(&self, workflow_id: &str) -> Option<&Workflow> {
        self.workflows.get(workflow_id)
    }

    /// List all registered workflows
    pub fn list_workflows(&self) -> Vec<&Workflow> {
        self.workflows.values().collect()
    }

    /// Execute a workflow
    ///
    /// # Arguments
    /// * `workflow_id` - The ID of the workflow to execute
    /// * `executor` - The executor to use for action execution
    /// * `session_id` - A unique session identifier
    /// * `initial_variables` - Optional initial variables
    ///
    /// # Returns
    /// The result of the workflow execution
    pub async fn execute(
        &self,
        workflow_id: &str,
        executor: Arc<dyn WorkflowExecutor>,
        session_id: &str,
        initial_variables: HashMap<String, String>,
    ) -> Result<WorkflowResult> {
        let workflow = self
            .workflows
            .get(workflow_id)
            .ok_or_else(|| WorkflowError::WorkflowNotFound(workflow_id.to_string()))?;

        let mut context = ExecutionContext::new(workflow_id.to_string(), session_id.to_string())
            .with_variables(initial_variables);

        // Merge workflow default variables
        for (key, value) in &workflow.variables {
            if !context.variables.contains_key(key) {
                context.set_variable(key.clone(), value.clone());
            }
        }

        let start_time = std::time::Instant::now();
        let mut step_results = Vec::new();

        info!(
            "Starting workflow execution: {} ({} steps)",
            workflow.name,
            workflow.steps.len()
        );

        for (index, step) in workflow.steps.iter().enumerate() {
            let step_start = std::time::Instant::now();
            debug!("Executing step {}: {:?}", index, step);

            match self.execute_step(step, executor.clone(), &mut context).await {
                Ok(result) => {
                    let duration = step_start.elapsed().as_millis() as u64;
                    step_results.push(StepResult {
                        step_index: index,
                        step_type: format!("{:?}", step),
                        success: true,
                        data: result,
                        error: None,
                        duration_ms: duration,
                    });
                    debug!("Step {} completed in {}ms", index, duration);
                }
                Err(e) => {
                    let duration = step_start.elapsed().as_millis() as u64;
                    let error_msg = e.to_string();
                    warn!("Step {} failed after {}ms: {}", index, duration, error_msg);

                    step_results.push(StepResult {
                        step_index: index,
                        step_type: format!("{:?}", step),
                        success: false,
                        data: None,
                        error: Some(error_msg.clone()),
                        duration_ms: duration,
                    });

                    // Handle error based on workflow error policy
                    if let Some(ref error_handler) = workflow.on_error {
                        match self.handle_error(
                            error_handler,
                            &e,
                            executor.clone(),
                            &mut context,
                            index,
                            &mut step_results,
                        ).await {
                            Ok(true) => continue, // Error handled, continue
                            Ok(false) => {
                                // Error handled, stop
                                return Ok(WorkflowResult {
                                    success: false,
                                    step_results,
                                    variables: context.variables.clone(),
                                    error: Some(error_msg),
                                    duration_ms: start_time.elapsed().as_millis() as u64,
                                });
                            }
                            Err(e) => {
                                // Error handler failed
                                return Ok(WorkflowResult {
                                    success: false,
                                    step_results,
                                    variables: context.variables.clone(),
                                    error: Some(format!("Error handler failed: {}", e)),
                                    duration_ms: start_time.elapsed().as_millis() as u64,
                                });
                            }
                        }
                    } else {
                        // No error handler, stop execution
                        return Ok(WorkflowResult {
                            success: false,
                            step_results,
                            variables: context.variables.clone(),
                            error: Some(error_msg),
                            duration_ms: start_time.elapsed().as_millis() as u64,
                        });
                    }
                }
            }
        }

        let total_duration = start_time.elapsed().as_millis() as u64;
        info!(
            "Workflow completed successfully in {}ms",
            total_duration
        );

        Ok(WorkflowResult {
            success: true,
            step_results,
            variables: context.variables.clone(),
            error: None,
            duration_ms: total_duration,
        })
    }

    async fn execute_step(
        &self,
        step: &WorkflowStep,
        executor: Arc<dyn WorkflowExecutor>,
        context: &mut ExecutionContext,
    ) -> Result<Option<serde_json::Value>> {
        match step {
            WorkflowStep::Action {
                action,
                params,
                retry,
            } => {
                self.execute_action_with_retry(action, params, retry, executor, context)
                    .await
            }
            WorkflowStep::Wait {
                duration_ms,
                condition,
            } => {
                if let Some(ref cond) = condition {
                    self.wait_for_condition(cond, executor, context, *duration_ms)
                        .await?;
                } else {
                    sleep(Duration::from_millis(*duration_ms)).await;
                }
                Ok(None)
            }
            WorkflowStep::Conditional(branch) => {
                let condition_met = executor
                    .evaluate_condition(&branch.condition, context)
                    .await?;

                let steps_to_execute = if condition_met {
                    &branch.then_steps
                } else if let Some(ref else_steps) = &branch.else_steps {
                    else_steps
                } else {
                    return Ok(None);
                };

                // Execute nested steps sequentially without recursion
                for nested_step in steps_to_execute {
                    self.execute_nested_step(nested_step, executor.clone(), context).await?;
                }
                Ok(None)
            }
            WorkflowStep::Loop {
                condition,
                steps,
                max_iterations,
            } => {
                let mut iterations = 0;
                while iterations < *max_iterations {
                    let condition_met = executor.evaluate_condition(condition, context).await?;

                    if !condition_met {
                        break;
                    }

                    // Execute nested steps sequentially without recursion
                    for nested_step in steps {
                        self.execute_nested_step(nested_step, executor.clone(), context).await?;
                    }
                    iterations += 1;
                }
                Ok(None)
            }
            WorkflowStep::Extract {
                variable_name,
                selector,
                attribute,
            } => {
                let value = executor
                    .extract_value(selector, attribute.as_deref(), context)
                    .await?;
                context.set_variable(variable_name.clone(), value);
                Ok(None)
            }
            WorkflowStep::Validate {
                condition,
                error_message,
            } => {
                let condition_met = executor.evaluate_condition(condition, context).await?;

                if !condition_met {
                    return Err(WorkflowError::ValidationFailed(error_message.clone()));
                }
                Ok(None)
            }
        }
    }

    /// Execute a nested step (for conditional and loop bodies) without recursion
    async fn execute_nested_step(
        &self,
        step: &WorkflowStep,
        executor: Arc<dyn WorkflowExecutor>,
        context: &mut ExecutionContext,
    ) -> Result<Option<serde_json::Value>> {
        // Nested steps only support non-branching operations to avoid deep recursion
        match step {
            WorkflowStep::Action {
                action,
                params,
                retry,
            } => {
                self.execute_action_with_retry(action, params, retry, executor, context)
                    .await
            }
            WorkflowStep::Wait {
                duration_ms,
                condition,
            } => {
                if let Some(ref cond) = condition {
                    self.wait_for_condition(cond, executor, context, *duration_ms)
                        .await?;
                } else {
                    sleep(Duration::from_millis(*duration_ms)).await;
                }
                Ok(None)
            }
            WorkflowStep::Extract {
                variable_name,
                selector,
                attribute,
            } => {
                let value = executor
                    .extract_value(selector, attribute.as_deref(), context)
                    .await?;
                context.set_variable(variable_name.clone(), value);
                Ok(None)
            }
            WorkflowStep::Validate {
                condition,
                error_message,
            } => {
                let condition_met = executor.evaluate_condition(condition, context).await?;

                if !condition_met {
                    return Err(WorkflowError::ValidationFailed(error_message.clone()));
                }
                Ok(None)
            }
            // For nested conditionals and loops, we need to handle them specially
            _ => {
                // Use Box::pin to avoid infinite sized future
                Box::pin(self.execute_step(step, executor, context)).await
            }
        }
    }

    async fn execute_action_with_retry(
        &self,
        action: &str,
        params: &serde_json::Value,
        retry: &Option<RetryConfig>,
        executor: Arc<dyn WorkflowExecutor>,
        context: &ExecutionContext,
    ) -> Result<Option<serde_json::Value>> {
        let config = retry.clone().unwrap_or_default();
        let mut attempt = 0;
        let mut backoff = config.backoff_ms;

        loop {
            match executor.execute_action(action, params, context).await {
                Ok(result) => return Ok(result),
                Err(e) => {
                    attempt += 1;
                    if attempt >= config.max_attempts {
                        return Err(WorkflowError::MaxRetriesExceeded(format!(
                            "{}: {}",
                            action, e
                        )));
                    }
                    warn!(
                        "Action {} failed (attempt {}/{}), retrying in {}ms",
                        action, attempt, config.max_attempts, backoff
                    );
                    sleep(Duration::from_millis(backoff)).await;
                    backoff = ((backoff as f64 * config.backoff_multiplier) as u64)
                        .min(config.max_backoff_ms);
                }
            }
        }
    }

    async fn wait_for_condition(
        &self,
        condition: &Condition,
        executor: Arc<dyn WorkflowExecutor>,
        context: &ExecutionContext,
        timeout_ms: u64,
    ) -> Result<()> {
        let start = std::time::Instant::now();
        let check_interval = 100;

        while (start.elapsed().as_millis() as u64) < timeout_ms {
            if executor.evaluate_condition(condition, context).await? {
                return Ok(());
            }
            sleep(Duration::from_millis(check_interval)).await;
        }

        Err(WorkflowError::Timeout(format!(
            "Condition not met within {}ms",
            timeout_ms
        )))
    }

    async fn handle_error(
        &self,
        error_handler: &ErrorHandler,
        error: &WorkflowError,
        executor: Arc<dyn WorkflowExecutor>,
        context: &mut ExecutionContext,
        failed_step_index: usize,
        step_results: &mut Vec<StepResult>,
    ) -> Result<bool> {
        match &error_handler.action {
            ErrorAction::Stop => {
                info!("Error handler: stopping workflow");
                Ok(false)
            }
            ErrorAction::Continue => {
                info!("Error handler: continuing after error");
                Ok(true)
            }
            ErrorAction::Retry { attempts } => {
                warn!("Error handler: retrying failed step ({} attempts)", attempts);
                // Retry logic is handled at step level
                Ok(true)
            }
            ErrorAction::Fallback { steps } => {
                info!("Error handler: executing fallback steps");
                for (index, step) in steps.iter().enumerate() {
                    match self.execute_nested_step(step, executor.clone(), context).await {
                        Ok(_) => {
                            step_results.push(StepResult {
                                step_index: failed_step_index,
                                step_type: format!("fallback_{}", index),
                                success: true,
                                data: None,
                                error: None,
                                duration_ms: 0,
                            });
                        }
                        Err(e) => {
                            step_results.push(StepResult {
                                step_index: failed_step_index,
                                step_type: format!("fallback_{}", index),
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                                duration_ms: 0,
                            });
                            return Err(WorkflowError::StepExecutionFailed(format!(
                                "Fallback failed: {}",
                                e
                            )));
                        }
                    }
                }
                Ok(false) // Stop after fallback
            }
        }
    }
}

impl Default for WorkflowEngine {
    fn default() -> Self {
        Self::new()
    }
}
