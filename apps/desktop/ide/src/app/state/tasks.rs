use crate::types::tasks::{TaskRunnerConfig, Task};

#[derive(Debug, Clone, Default)]
pub struct TasksState {
    pub config: TaskRunnerConfig,
    pub running_task: Option<Task>,
    pub task_history: Vec<Task>,
    pub running: bool,
}

impl TasksState {
    pub fn new() -> Self {
        Self {
            config: TaskRunnerConfig::new(),
            running_task: None,
            task_history: Vec::new(),
            running: false,
        }
    }

    pub fn with_config(mut self, config: TaskRunnerConfig) -> Self {
        self.config = config;
        self
    }

    pub fn with_running_task(mut self, task: Task) -> Self {
        self.running_task = Some(task);
        self
    }

    pub fn with_task_history(mut self, history: Vec<Task>) -> Self {
        self.task_history = history;
        self
    }

    pub fn with_running(mut self, running: bool) -> Self {
        self.running = running;
        self
    }

    pub fn set_config(&mut self, config: TaskRunnerConfig) {
        self.config = config;
    }

    pub fn set_running_task(&mut self, task: Task) {
        self.running_task = Some(task);
    }

    pub fn set_running(&mut self, running: bool) {
        self.running = running;
    }

    pub fn add_to_history(&mut self, task: Task) {
        self.task_history.push(task);
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn history_count(&self) -> usize {
        self.task_history.len()
    }

    pub fn get_task_by_name(&self, name: &str) -> Option<&Task> {
        self.task_history.iter().find(|t| t.name == name)
    }
}
