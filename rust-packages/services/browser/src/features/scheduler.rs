use crate::protocol::workflows::Workflow;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::{mpsc, Mutex};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledTask {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub schedule: ScheduleType,
    pub workflow: Workflow,
    pub enabled: bool,
    pub created_at: String,
    pub last_run: Option<String>,
    pub next_run: Option<String>,
    pub run_count: u64,
    pub max_runs: Option<u64>,
    pub timeout_seconds: u64,
    pub retry_policy: RetryPolicy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ScheduleType {
    Once { at: u64 }, // Unix timestamp
    Interval { seconds: u64 },
    Daily { hour: u8, minute: u8, timezone: String },
    Weekly { day: WeekDay, hour: u8, minute: u8, timezone: String },
    Monthly { day: u8, hour: u8, minute: u8, timezone: String },
    Cron { expression: String },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum WeekDay {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_retries: u32,
    pub retry_interval_seconds: u64,
    pub backoff_multiplier: f64,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_retries: 3,
            retry_interval_seconds: 60,
            backoff_multiplier: 2.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskExecutionResult {
    pub task_id: String,
    pub execution_id: String,
    pub start_time: String,
    pub end_time: Option<String>,
    pub success: bool,
    pub error: Option<String>,
    pub retry_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerStats {
    pub total_tasks: usize,
    pub enabled_tasks: usize,
    pub total_executions: u64,
    pub failed_executions: u64,
    pub next_scheduled_task: Option<String>,
}

pub struct TaskScheduler {
    tasks: Arc<Mutex<HashMap<String, ScheduledTask>>>,
    execution_history: Arc<Mutex<Vec<TaskExecutionResult>>>,
    running: Arc<Mutex<bool>>,
    command_tx: mpsc::Sender<SchedulerCommand>,
}

#[derive(Debug, Clone)]
enum SchedulerCommand {
    AddTask(ScheduledTask),
    RemoveTask(String),
    EnableTask(String),
    DisableTask(String),
    ExecuteNow(String),
    Shutdown,
}

impl TaskScheduler {
    pub fn new() -> Self {
        let (tx, _rx) = mpsc::channel(100);
        
        Self {
            tasks: Arc::new(Mutex::new(HashMap::new())),
            execution_history: Arc::new(Mutex::new(Vec::new())),
            running: Arc::new(Mutex::new(false)),
            command_tx: tx,
        }
    }

    pub async fn add_task(&self, task: ScheduledTask) {
        let mut tasks = self.tasks.lock().await;
        tasks.insert(task.id.clone(), task);
    }

    pub async fn remove_task(&self, task_id: &str) -> Option<ScheduledTask> {
        let mut tasks = self.tasks.lock().await;
        tasks.remove(task_id)
    }

    pub async fn get_task(&self, task_id: &str) -> Option<ScheduledTask> {
        let tasks = self.tasks.lock().await;
        tasks.get(task_id).cloned()
    }

    pub async fn list_tasks(&self) -> Vec<ScheduledTask> {
        let tasks = self.tasks.lock().await;
        tasks.values().cloned().collect()
    }

    pub async fn enable_task(&self, task_id: &str) -> bool {
        let mut tasks = self.tasks.lock().await;
        if let Some(task) = tasks.get_mut(task_id) {
            task.enabled = true;
            true
        } else {
            false
        }
    }

    pub async fn disable_task(&self, task_id: &str) -> bool {
        let mut tasks = self.tasks.lock().await;
        if let Some(task) = tasks.get_mut(task_id) {
            task.enabled = false;
            true
        } else {
            false
        }
    }

    pub async fn execute_task_now(&self, task_id: &str) -> Result<TaskExecutionResult, String> {
        let tasks = self.tasks.lock().await;
        let task = tasks.get(task_id).cloned().ok_or("Task not found")?;
        drop(tasks);

        self.execute_task(&task).await
    }

    async fn execute_task(&self, task: &ScheduledTask) -> Result<TaskExecutionResult, String> {
        let execution_id = uuid::Uuid::new_v4().to_string();
        let start_time = chrono::Utc::now().to_rfc3339();

        // Update last run
        let mut tasks = self.tasks.lock().await;
        if let Some(t) = tasks.get_mut(&task.id) {
            t.last_run = Some(start_time.clone());
            t.run_count += 1;
        }
        drop(tasks);

        // Simulate workflow execution
        // In production, this would actually execute the workflow
        let success = true;
        let error = None;

        let result = TaskExecutionResult {
            task_id: task.id.clone(),
            execution_id,
            start_time,
            end_time: Some(chrono::Utc::now().to_rfc3339()),
            success,
            error,
            retry_count: 0,
        };

        // Store in history
        let mut history = self.execution_history.lock().await;
        history.push(result.clone());
        if history.len() > 1000 {
            history.remove(0);
        }

        Ok(result)
    }

    pub async fn get_execution_history(&self, task_id: Option<&str>) -> Vec<TaskExecutionResult> {
        let history = self.execution_history.lock().await;
        
        if let Some(id) = task_id {
            history.iter()
                .filter(|h| h.task_id == id)
                .cloned()
                .collect()
        } else {
            history.clone()
        }
    }

    pub async fn get_stats(&self) -> SchedulerStats {
        let tasks = self.tasks.lock().await;
        let history = self.execution_history.lock().await;

        let enabled_count = tasks.values().filter(|t| t.enabled).count();
        let total_execs = history.len() as u64;
        let failed_execs = history.iter().filter(|h| !h.success).count() as u64;

        SchedulerStats {
            total_tasks: tasks.len(),
            enabled_tasks: enabled_count,
            total_executions: total_execs,
            failed_executions: failed_execs,
            next_scheduled_task: None,
        }
    }

    pub async fn start(&self) {
        let mut running = self.running.lock().await;
        *running = true;
        
        // Start the scheduler loop
        let tasks = self.tasks.clone();
        let running = self.running.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));
            
            loop {
                interval.tick().await;
                
                let is_running = *running.lock().await;
                if !is_running {
                    break;
                }

                let now = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();

                let tasks_guard = tasks.lock().await;
                let due_tasks: Vec<ScheduledTask> = tasks_guard
                    .values()
                    .filter(|t| t.enabled && Self::should_run(t, now))
                    .cloned()
                    .collect();
                drop(tasks_guard);

                for task in due_tasks {
                    // Execute task
                    // In production, this would spawn a new task
                }
            }
        });
    }

    pub async fn stop(&self) {
        let mut running = self.running.lock().await;
        *running = false;
    }

    fn should_run(task: &ScheduledTask, now: u64) -> bool {
        if let Some(max) = task.max_runs {
            if task.run_count >= max {
                return false;
            }
        }

        match &task.schedule {
            ScheduleType::Once { at } => {
                now >= *at && task.run_count == 0
            }
            ScheduleType::Interval { seconds } => {
                if let Some(ref last) = task.last_run {
                    if let Ok(last_time) = chrono::DateTime::parse_from_rfc3339(last) {
                        let last_secs = last_time.timestamp() as u64;
                        now >= last_secs + seconds
                    } else {
                        true
                    }
                } else {
                    true
                }
            }
            _ => {
                // For more complex schedules, calculate next run time
                true
            }
        }
    }

    pub fn calculate_next_run(&self, schedule: &ScheduleType) -> Option<u64> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        match schedule {
            ScheduleType::Once { at } => {
                if now < *at {
                    Some(*at)
                } else {
                    None
                }
            }
            ScheduleType::Interval { seconds } => {
                Some(now + seconds)
            }
            _ => None,
        }
    }
}

impl Default for TaskScheduler {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CronParser;

impl CronParser {
    pub fn parse(expression: &str) -> Result<Vec<ScheduleType>, String> {
        // Simplified cron parser
        // In production, use a proper cron parsing library
        let parts: Vec<&str> = expression.split_whitespace().collect();
        
        if parts.len() != 5 {
            return Err("Invalid cron expression. Expected 5 fields: minute hour day month weekday".to_string());
        }

        // Parse and create schedule
        Ok(vec![ScheduleType::Cron {
            expression: expression.to_string(),
        }])
    }
}
