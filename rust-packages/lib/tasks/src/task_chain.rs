use crate::error::Result;
use crate::store::TaskStore;
use super::dependency_types::{DependencyType, TaskDependency};

/// Task chain for sequential execution
pub struct TaskChain {
    tasks: Vec<String>,
}

impl TaskChain {
    /// Create a new task chain
    pub fn new() -> Self {
        Self {
            tasks: Vec::new(),
        }
    }

    /// Add a task to the chain
    pub fn add_task(mut self, task_id: String) -> Self {
        self.tasks.push(task_id);
        self
    }

    /// Build dependencies for the chain
    pub async fn build_dependencies<S: TaskStore>(&self, store: &S) -> Result<()> {
        let manager = super::DependencyManager::new(store);

        for i in 1..self.tasks.len() {
            let task_id = &self.tasks[i];
            let depends_on = &self.tasks[i - 1];

            manager.add_dependencies(
                task_id,
                vec![TaskDependency {
                    task_id: depends_on.clone(),
                    dependency_type: DependencyType::Success,
                }],
            ).await?;
        }

        Ok(())
    }

    /// Get tasks in the chain
    pub fn tasks(&self) -> &[String] {
        &self.tasks
    }
}

impl Default for TaskChain {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_chain() {
        let chain = TaskChain::new()
            .add_task("task1".to_string())
            .add_task("task2".to_string())
            .add_task("task3".to_string());

        assert_eq!(chain.tasks(), &["task1", "task2", "task3"]);
    }
}
