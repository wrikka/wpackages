//! Task dependencies and DAG support

use crate::error::{Result, TaskError};
use crate::store::TaskStore;
use crate::types::{Task, TaskStatus};
use serde_json;
use std::collections::HashSet;

pub mod dependency_graph;
pub mod dependency_types;
pub mod task_chain;

pub use dependency_graph::DependencyGraph;
pub use dependency_types::{DependencyType, TaskDependency};
pub use task_chain::TaskChain;

/// Task dependency manager
pub struct DependencyManager<S: TaskStore> {
    store: S,
}

impl<S: TaskStore> DependencyManager<S> {
    /// Create a new dependency manager
    pub fn new(store: S) -> Self {
        Self { store }
    }

    /// Add dependencies to a task
    pub async fn add_dependencies(
        &self,
        task_id: &str,
        dependencies: Vec<TaskDependency>,
    ) -> Result<()> {
        let mut task = self
            .store
            .get_task(task_id)
            .await?
            .ok_or_else(|| TaskError::Other(format!("Task {} not found", task_id)))?;

        // Store dependencies in task metadata
        let deps: Vec<TaskDependency> = serde_json::from_value(
            task.metadata
                .get("dependencies")
                .cloned()
                .unwrap_or_else(|| serde_json::json!([])),
        )
        .unwrap_or_default();

        let mut all_deps = deps;
        all_deps.extend(dependencies);

        task.metadata["dependencies"] =
            serde_json::to_value(&all_deps).map_err(TaskError::Serialization)?;

        self.store.update_task(&task).await?;
        Ok(())
    }

    /// Get dependencies for a task
    pub async fn get_dependencies(&self, task_id: &str) -> Result<Vec<TaskDependency>> {
        let task = self
            .store
            .get_task(task_id)
            .await?
            .ok_or_else(|| TaskError::Other(format!("Task {} not found", task_id)))?;

        let deps: Vec<TaskDependency> = serde_json::from_value(
            task.metadata
                .get("dependencies")
                .cloned()
                .unwrap_or_else(|| serde_json::json!([])),
        )
        .unwrap_or_default();

        Ok(deps)
    }

    /// Check if a task can run based on its dependencies
    pub async fn can_run(&self, task_id: &str) -> Result<bool> {
        let dependencies = self.get_dependencies(task_id).await?;

        for dep in dependencies {
            let dep_task = self.store.get_task(&dep.task_id).await?.ok_or_else(|| {
                TaskError::Other(format!("Dependency task {} not found", dep.task_id))
            })?;

            match dep.dependency_type {
                DependencyType::Success => {
                    if dep_task.status != TaskStatus::Completed {
                        return Ok(false);
                    }
                }
                DependencyType::Completion => {
                    if !matches!(
                        dep_task.status,
                        TaskStatus::Completed | TaskStatus::Failed | TaskStatus::Cancelled
                    ) {
                        return Ok(false);
                    }
                }
                DependencyType::Failure => {
                    if dep_task.status != TaskStatus::Failed {
                        return Ok(false);
                    }
                }
            }
        }

        Ok(true)
    }

    /// Get tasks that depend on a given task
    pub async fn get_dependent_tasks(&self, task_id: &str) -> Result<Vec<Task>> {
        let all_tasks = self.store.list_tasks(None).await?;
        let mut dependent_tasks = Vec::new();

        for task in all_tasks {
            let dependencies = self.get_dependencies(&task.id).await?;
            for dep in dependencies {
                if dep.task_id == task_id {
                    dependent_tasks.push(task);
                    break;
                }
            }
        }

        Ok(dependent_tasks)
    }

    /// Build a dependency graph for a set of tasks
    pub async fn build_dependency_graph(&self, task_ids: &[String]) -> Result<DependencyGraph> {
        let mut graph = DependencyGraph::new();

        for task_id in task_ids {
            let task = self
                .store
                .get_task(task_id)
                .await?
                .ok_or_else(|| TaskError::Other(format!("Task {} not found", task_id)))?;

            graph.add_task(task.clone());

            let dependencies = self.get_dependencies(task_id).await?;
            for dep in dependencies {
                graph.add_dependency(task_id.clone(), dep.task_id.clone());
            }
        }

        Ok(graph)
    }

    /// Get execution order for tasks (topological sort)
    pub async fn get_execution_order(&self, task_ids: &[String]) -> Result<Vec<String>> {
        let graph = self.build_dependency_graph(task_ids).await?;
        graph.topological_sort()
    }

    /// Detect circular dependencies
    pub async fn detect_cycles(&self, task_id: &str) -> Result<bool> {
        let dependencies = self.get_dependencies(task_id).await?;

        for dep in dependencies {
            if self
                .has_cycle(task_id, &dep.task_id, &mut HashSet::new())
                .await?
            {
                return Ok(true);
            }
        }

        Ok(false)
    }

    /// Check if there's a cycle in dependencies
    async fn has_cycle(
        &self,
        start: &str,
        current: &str,
        visited: &mut HashSet<String>,
    ) -> Result<bool> {
        if current == start {
            return Ok(true);
        }

        if visited.contains(current) {
            return Ok(false);
        }

        visited.insert(current.to_string());

        let dependencies = self.get_dependencies(current).await?;
        for dep in dependencies {
            if self.has_cycle(start, &dep.task_id, visited).await? {
                return Ok(true);
            }
        }

        visited.remove(current);
        Ok(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_dependency_manager() {
        // This test requires a TaskStore implementation
        // Placeholder test
    }
}
