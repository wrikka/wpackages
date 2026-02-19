use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum TaskStatus {
    Todo,
    InProgress,
    Done,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
    pub id: String,
    pub description: String,
    pub status: TaskStatus,
    pub file_path: Option<String>,
    pub line_number: Option<usize>,
}

pub struct TaskManagerService {
    tasks: HashMap<String, Task>,
}

impl Default for TaskManagerService {
    fn default() -> Self {
        Self::new()
    }
}

impl TaskManagerService {
    pub fn new() -> Self {
        Self {
            tasks: HashMap::new(),
        }
    }

    // Scans a file's content for TODO comments and adds them as tasks.
    pub fn scan_file_for_tasks(&mut self, file_path: &str, content: &str) {
        for (i, line) in content.lines().enumerate() {
            if line.contains("TODO:") {
                let description = line.split("TODO:").nth(1).unwrap_or("").trim().to_string();
                let task = Task {
                    id: format!("{}:{}", file_path, i + 1),
                    description,
                    status: TaskStatus::Todo,
                    file_path: Some(file_path.to_string()),
                    line_number: Some(i + 1),
                };
                self.tasks.insert(task.id.clone(), task);
            }
        }
    }

    pub fn get_all_tasks(&self) -> Vec<&Task> {
        self.tasks.values().collect()
    }

    pub fn update_task_status(&mut self, task_id: &str, status: TaskStatus) -> Result<()> {
        let task = self
            .tasks
            .get_mut(task_id)
            .ok_or_else(|| anyhow::anyhow!("Task not found"))?;
        task.status = status;
        Ok(())
    }
}
