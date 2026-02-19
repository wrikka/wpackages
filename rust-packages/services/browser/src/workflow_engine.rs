use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::workflows::{Condition, ErrorAction, RetryConfig, StepResult, Workflow, WorkflowResult, WorkflowStep};
use crate::protocol::{Action, Params, Response};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::time::sleep;

pub struct WorkflowEngine {
    workflows: HashMap<String, Workflow>,
}

impl WorkflowEngine {
    pub fn new() -> Self {
        Self {
            workflows: HashMap::new(),
        }
    }

    pub fn save_workflow(&mut self, workflow: Workflow) -> Result<()> {
        self.workflows.insert(workflow.name.clone(), workflow);
        Ok(())
    }

    pub fn get_workflow(&self, name: &str) -> Option<&Workflow> {
        self.workflows.get(name)
    }

    pub fn delete_workflow(&mut self, name: &str) -> Result<()> {
        self.workflows.remove(name);
        Ok(())
    }

    pub fn list_workflows(&self) -> Vec<&Workflow> {
        self.workflows.values().collect()
    }

    pub async fn execute_workflow(
        &self,
        workflow: &Workflow,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<WorkflowResult> {
        let start_time = Instant::now();
        let mut variables = workflow.variables.clone();
        let mut step_results = Vec::new();

        for (index, step) in workflow.steps.iter().enumerate() {
            let step_start = Instant::now();
            
            match self.execute_step(
                step,
                browser_manager,
                session_id,
                headless,
                datadir,
                stealth,
                &mut variables,
            ).await {
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
                }
                Err(e) => {
                    let duration = step_start.elapsed().as_millis() as u64;
                    step_results.push(StepResult {
                        step_index: index,
                        step_type: format!("{:?}", step),
                        success: false,
                        data: None,
                        error: Some(e.to_string()),
                        duration_ms: duration,
                    });

                    // Handle error based on workflow error policy
                    if let Some(ref error_handler) = workflow.on_error {
                        match error_handler.action {
                            ErrorAction::Stop => {
                                return Ok(WorkflowResult {
                                    success: false,
                                    step_results,
                                    variables,
                                    error: Some(e.to_string()),
                                    duration_ms: start_time.elapsed().as_millis() as u64,
                                });
                            }
                            ErrorAction::Continue => continue,
                            ErrorAction::Retry { attempts } => {
                                // Retry logic implemented at step level
                                continue;
                            }
                            ErrorAction::Fallback { ref steps } => {
                                // Execute fallback steps
                                for fallback_step in steps {
                                    if let Err(e) = self.execute_step(
                                        fallback_step,
                                        browser_manager,
                                        session_id,
                                        headless,
                                        datadir,
                                        stealth,
                                        &mut variables,
                                    ).await {
                                        return Ok(WorkflowResult {
                                            success: false,
                                            step_results,
                                            variables,
                                            error: Some(format!("Fallback failed: {}", e)),
                                            duration_ms: start_time.elapsed().as_millis() as u64,
                                        });
                                    }
                                }
                            }
                        }
                    } else {
                        return Ok(WorkflowResult {
                            success: false,
                            step_results,
                            variables,
                            error: Some(e.to_string()),
                            duration_ms: start_time.elapsed().as_millis() as u64,
                        });
                    }
                }
            }
        }

        Ok(WorkflowResult {
            success: true,
            step_results,
            variables,
            error: None,
            duration_ms: start_time.elapsed().as_millis() as u64,
        })
    }

    async fn execute_step(
        &self,
        step: &WorkflowStep,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        variables: &mut HashMap<String, String>,
    ) -> Result<Option<serde_json::Value>> {
        match step {
            WorkflowStep::Action { action, params, retry } => {
                self.execute_action_with_retry(
                    action, params, retry, browser_manager, session_id, headless, datadir, stealth,
                ).await
            }
            WorkflowStep::Wait { duration_ms, condition } => {
                if let Some(ref cond) = condition {
                    // Wait for condition
                    self.wait_for_condition(cond, browser_manager, session_id, headless, datadir, stealth, *duration_ms).await?;
                } else {
                    sleep(Duration::from_millis(*duration_ms)).await;
                }
                Ok(None)
            }
            WorkflowStep::Conditional(branch) => {
                let condition_met = self.evaluate_condition(
                    &branch.condition, browser_manager, session_id, headless, datadir, stealth,
                ).await?;

                let steps_to_execute = if condition_met {
                    &branch.then_steps
                } else if let Some(ref else_steps) = branch.else_steps {
                    else_steps
                } else {
                    return Ok(None);
                };

                for step in steps_to_execute {
                    self.execute_step(step, browser_manager, session_id, headless, datadir, stealth, variables).await?;
                }
                Ok(None)
            }
            WorkflowStep::Loop { condition, steps, max_iterations } => {
                let mut iterations = 0;
                while iterations < *max_iterations {
                    let condition_met = self.evaluate_condition(
                        condition, browser_manager, session_id, headless, datadir, stealth,
                    ).await?;
                    
                    if !condition_met {
                        break;
                    }

                    for step in steps {
                        self.execute_step(step, browser_manager, session_id, headless, datadir, stealth, variables).await?;
                    }
                    iterations += 1;
                }
                Ok(None)
            }
            WorkflowStep::Extract { variable_name, selector, attribute } => {
                let value = self.extract_value(
                    selector, attribute.as_deref(), browser_manager, session_id, headless, datadir, stealth,
                ).await?;
                variables.insert(variable_name.clone(), value);
                Ok(None)
            }
            WorkflowStep::Validate { condition, error_message } => {
                let condition_met = self.evaluate_condition(
                    condition, browser_manager, session_id, headless, datadir, stealth,
                ).await?;
                
                if !condition_met {
                    return Err(crate::error::Error::Validation(error_message.clone()));
                }
                Ok(None)
            }
        }
    }

    async fn execute_action_with_retry(
        &self,
        action: &Action,
        params: &Params,
        retry: &Option<RetryConfig>,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<Option<serde_json::Value>> {
        let config = retry.clone().unwrap_or_default();
        let mut attempt = 0;
        let mut backoff = config.backoff_ms;

        loop {
            match browser_manager.execute_action(action.clone(), params.clone(), session_id, headless, datadir, stealth).await {
                Ok(result) => return Ok(result),
                Err(e) => {
                    attempt += 1;
                    if attempt >= config.max_attempts {
                        return Err(e);
                    }
                    sleep(Duration::from_millis(backoff)).await;
                    backoff = ((backoff as f64 * config.backoff_multiplier) as u64).min(config.max_backoff_ms);
                }
            }
        }
    }

    async fn evaluate_condition(
        &self,
        condition: &Condition,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<bool> {
        match condition {
            Condition::ElementExists { selector } => {
                let result = browser_manager
                    .execute_action(
                        Action::GetCount,
                        Params::GetCount(crate::protocol::params::GetCountParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                
                if let Some(value) = result {
                    if let Some(count) = value.as_u64() {
                        return Ok(count > 0);
                    }
                }
                Ok(false)
            }
            Condition::ElementVisible { selector } => {
                let result = browser_manager
                    .execute_action(
                        Action::IsVisible,
                        Params::IsVisible(crate::protocol::params::IsVisibleParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                
                if let Some(value) = result {
                    if let Some(visible) = value.as_bool() {
                        return Ok(visible);
                    }
                }
                Ok(false)
            }
            Condition::TextContains { selector, text } => {
                let result = browser_manager
                    .execute_action(
                        Action::GetText,
                        Params::GetText(crate::protocol::params::GetTextParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                
                if let Some(value) = result {
                    if let Some(content) = value.as_str() {
                        return Ok(content.contains(text));
                    }
                }
                Ok(false)
            }
            Condition::UrlContains { text } => {
                let result = browser_manager
                    .execute_action(Action::GetUrl, Params::Empty, session_id, headless, datadir, stealth)
                    .await?;
                
                if let Some(value) = result {
                    if let Some(url) = value.as_str() {
                        return Ok(url.contains(text));
                    }
                }
                Ok(false)
            }
            Condition::TitleContains { text } => {
                let result = browser_manager
                    .execute_action(Action::GetTitle, Params::Empty, session_id, headless, datadir, stealth)
                    .await?;
                
                if let Some(value) = result {
                    if let Some(title) = value.as_str() {
                        return Ok(title.contains(text));
                    }
                }
                Ok(false)
            }
            Condition::Custom { script } => {
                let result = browser_manager
                    .execute_action(
                        Action::ExecuteJs,
                        Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                            session_id: Some(session_id.to_string()),
                            script: script.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                
                if let Some(value) = result {
                    if let Some(result_bool) = value.as_bool() {
                        return Ok(result_bool);
                    }
                }
                Ok(false)
            }
        }
    }

    async fn wait_for_condition(
        &self,
        condition: &Condition,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        timeout_ms: u64,
    ) -> Result<()> {
        let start = Instant::now();
        let check_interval = 100;
        
        while (start.elapsed().as_millis() as u64) < timeout_ms {
            if self.evaluate_condition(condition, browser_manager, session_id, headless, datadir, stealth).await? {
                return Ok(());
            }
            sleep(Duration::from_millis(check_interval)).await;
        }
        
        Err(crate::error::Error::Timeout(format!(
            "Condition not met within {}ms",
            timeout_ms
        )))
    }

    async fn extract_value(
        &self,
        selector: &str,
        attribute: Option<&str>,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<String> {
        let result = if let Some(attr) = attribute {
            browser_manager
                .execute_action(
                    Action::GetAttr,
                    Params::GetAttr(crate::protocol::params::GetAttrParams {
                        selector: selector.to_string(),
                        name: attr.to_string(),
                    }),
                    session_id,
                    headless,
                    datadir,
                    stealth,
                )
                .await?
        } else {
            browser_manager
                .execute_action(
                    Action::GetText,
                    Params::GetText(crate::protocol::params::GetTextParams {
                        selector: selector.to_string(),
                    }),
                    session_id,
                    headless,
                    datadir,
                    stealth,
                )
                .await?
        };

        if let Some(value) = result {
            if let Some(text) = value.as_str() {
                return Ok(text.to_string());
            }
        }
        
        Err(crate::error::Error::Extraction(format!(
            "Could not extract value from selector: {}",
            selector
        )))
    }
}
