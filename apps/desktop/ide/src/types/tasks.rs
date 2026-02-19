#[derive(Debug, Clone, Default)]
pub struct TaskRunnerConfig {
    pub parallel: bool,
    pub max_concurrent: usize,
    pub fail_fast: bool,
}

impl TaskRunnerConfig {
    pub fn new() -> Self {
        Self {
            parallel: false,
            max_concurrent: 1,
            fail_fast: false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: Option<String>,
    pub status: TaskStatus,
}

impl Task {
    pub fn new(id: String, name: String, command: String) -> Self {
        Self {
            id,
            name,
            command,
            args: Vec::new(),
            working_dir: None,
            status: TaskStatus::Pending,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskStatus {
    Pending,
    Running,
    Success,
    Failed,
}
