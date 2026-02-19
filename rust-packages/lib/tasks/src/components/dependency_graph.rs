use crate::error::{Result, TaskError};
use crate::types::Task;
use std::collections::HashMap;

/// Dependency graph representation
#[derive(Debug, Clone)]
pub struct DependencyGraph {
    tasks: HashMap<String, Task>,
    edges: HashMap<String, Vec<String>>, // task_id -> list of dependencies
}

impl DependencyGraph {
    /// Create a new dependency graph
    pub fn new() -> Self {
        Self {
            tasks: HashMap::new(),
            edges: HashMap::new(),
        }
    }

    /// Add a task to the graph
    pub fn add_task(&mut self, task: Task) {
        self.tasks.insert(task.id.clone(), task);
        self.edges.entry(task.id.clone()).or_insert_with(Vec::new);
    }

    /// Add a dependency edge
    pub fn add_dependency(&mut self, task_id: String, depends_on: String) {
        self.edges
            .entry(task_id)
            .or_insert_with(Vec::new)
            .push(depends_on);
    }

    /// Get topological sort order
    pub fn topological_sort(&self) -> Result<Vec<String>> {
        let mut in_degree: HashMap<String, usize> = HashMap::new();
        let mut order = Vec::new();
        let mut queue = Vec::new();

        // Calculate in-degrees
        for task_id in self.tasks.keys() {
            in_degree.entry(task_id.clone()).or_insert(0);
        }

        for dependencies in self.edges.values() {
            for dep in dependencies {
                *in_degree.entry(dep.clone()).or_insert(0) += 1;
            }
        }

        // Find tasks with no dependencies
        for (task_id, degree) in &in_degree {
            if *degree == 0 {
                queue.push(task_id.clone());
            }
        }

        // Process queue
        while let Some(task_id) = queue.pop() {
            order.push(task_id.clone());

            // Reduce in-degree for dependent tasks
            if let Some(dependents) = self.get_dependents(&task_id) {
                for dep in dependents {
                    if let Some(degree) = in_degree.get_mut(&dep) {
                        *degree -= 1;
                        if *degree == 0 {
                            queue.push(dep);
                        }
                    }
                }
            }
        }

        // Check for cycles
        if order.len() != self.tasks.len() {
            return Err(TaskError::Other(
                "Cycle detected in dependency graph".to_string(),
            ));
        }

        Ok(order)
    }

    /// Get tasks that depend on a given task
    fn get_dependents(&self, task_id: &str) -> Option<Vec<String>> {
        let mut dependents = Vec::new();

        for (tid, deps) in &self.edges {
            if deps.contains(&task_id.to_string()) {
                dependents.push(tid.clone());
            }
        }

        if dependents.is_empty() {
            None
        } else {
            Some(dependents)
        }
    }

    /// Get all tasks in the graph
    pub fn tasks(&self) -> &HashMap<String, Task> {
        &self.tasks
    }

    /// Get all edges in the graph
    pub fn edges(&self) -> &HashMap<String, Vec<String>> {
        &self.edges
    }
}

impl Default for DependencyGraph {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dependency_graph() {
        let mut graph = DependencyGraph::new();

        graph.add_task(Task::new("task1"));
        graph.add_task(Task::new("task2"));
        graph.add_task(Task::new("task3"));

        graph.add_dependency("task2".to_string(), "task1".to_string());
        graph.add_dependency("task3".to_string(), "task2".to_string());

        let order = graph.topological_sort().unwrap();
        assert_eq!(order, vec!["task1", "task2", "task3"]);
    }

    #[test]
    fn test_dependency_graph_cycle() {
        let mut graph = DependencyGraph::new();

        graph.add_task(Task::new("task1"));
        graph.add_task(Task::new("task2"));

        graph.add_dependency("task1".to_string(), "task2".to_string());
        graph.add_dependency("task2".to_string(), "task1".to_string());

        assert!(graph.topological_sort().is_err());
    }
}
