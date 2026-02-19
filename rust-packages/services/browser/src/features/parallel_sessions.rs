use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelTask {
    pub id: String,
    pub name: String,
    pub url: String,
    pub actions: Vec<TaskAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskAction {
    pub action: Action,
    pub params: Params,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelTaskResult {
    pub task_id: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelExecutionConfig {
    pub max_concurrent_tasks: usize,
    pub timeout_per_task_ms: u64,
    pub share_cookies: bool,
    pub share_storage: bool,
}

impl Default for ParallelExecutionConfig {
    fn default() -> Self {
        Self {
            max_concurrent_tasks: 5,
            timeout_per_task_ms: 60000,
            share_cookies: false,
            share_storage: false,
        }
    }
}

pub struct ParallelSessionManager;

impl ParallelSessionManager {
    pub fn new() -> Self {
        Self
    }

    pub async fn execute_parallel(
        &self,
        browser_manager: &BrowserManager,
        tasks: Vec<ParallelTask>,
        config: ParallelExecutionConfig,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Vec<ParallelTaskResult> {
        use tokio::time::{timeout, Duration};
        use std::time::Instant;

        let mut handles = vec![];

        for task in tasks {
            let task_id = task.id.clone();
            let session_id = format!("parallel_{}", task.id);
            
            // Clone what we need for the async block
            let browser_manager = browser_manager.clone();
            let task_clone = task.clone();
            let datadir = datadir.map(|s| s.to_string());
            
            let handle = tokio::spawn(async move {
                let start = Instant::now();
                
                let result = timeout(
                    Duration::from_millis(config.timeout_per_task_ms),
                    Self::execute_single_task(
                        browser_manager,
                        task_clone,
                        session_id,
                        headless,
                        datadir.as_deref(),
                        stealth,
                    )
                ).await;

                match result {
                    Ok(Ok(data)) => ParallelTaskResult {
                        task_id: task_id.clone(),
                        success: true,
                        data,
                        error: None,
                        duration_ms: start.elapsed().as_millis() as u64,
                    },
                    Ok(Err(e)) => ParallelTaskResult {
                        task_id: task_id.clone(),
                        success: false,
                        data: None,
                        error: Some(e.to_string()),
                        duration_ms: start.elapsed().as_millis() as u64,
                    },
                    Err(_) => ParallelTaskResult {
                        task_id: task_id.clone(),
                        success: false,
                        data: None,
                        error: Some("Task timed out".to_string()),
                        duration_ms: start.elapsed().as_millis() as u64,
                    },
                }
            });

            handles.push(handle);

            // Limit concurrency
            if handles.len() >= config.max_concurrent_tasks {
                break;
            }
        }

        let mut results = vec![];
        for handle in handles {
            if let Ok(result) = handle.await {
                results.push(result);
            }
        }

        results
    }

    async fn execute_single_task(
        browser_manager: BrowserManager,
        task: ParallelTask,
        session_id: String,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<Option<serde_json::Value>> {
        // Open the initial URL
        browser_manager
            .execute_action(
                Action::Open,
                Params::Open(crate::protocol::params::OpenParams { url: task.url }),
                &session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        // Execute all actions
        for action in task.actions {
            browser_manager
                .execute_action(
                    action.action,
                    action.params,
                    &session_id,
                    headless,
                    datadir,
                    stealth,
                )
                .await?;
        }

        // Return final page URL as result
        browser_manager
            .execute_action(Action::GetUrl, Params::Empty, &session_id, headless, datadir, stealth)
            .await
    }

    pub async fn scrape_multiple_urls(
        &self,
        browser_manager: &BrowserManager,
        urls: Vec<String>,
        extraction_selector: Option<String>,
        config: ParallelExecutionConfig,
        headless: bool,
        stealth: bool,
    ) -> Vec<ParallelTaskResult> {
        let tasks: Vec<ParallelTask> = urls
            .into_iter()
            .enumerate()
            .map(|(i, url)| ParallelTask {
                id: format!("scrape_{}", i),
                name: format!("Scrape {}", url),
                url: url.clone(),
                actions: if let Some(ref selector) = extraction_selector {
                    vec![
                        TaskAction {
                            action: Action::GetText,
                            params: Params::GetText(crate::protocol::params::GetTextParams {
                                selector: selector.clone(),
                            }),
                        },
                    ]
                } else {
                    vec![]
                },
            })
            .collect();

        self.execute_parallel(browser_manager, tasks, config, headless, None, stealth)
            .await
    }
}

impl Default for ParallelSessionManager {
    fn default() -> Self {
        Self::new()
    }
}
