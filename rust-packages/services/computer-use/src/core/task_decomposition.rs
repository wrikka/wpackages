//! Feature 6: Hierarchical Task Decomposition
//! 
//! Breaks complex tasks into manageable subtasks,
//! prioritizes subtasks,
//! creates dependency graphs for task orchestration.

use anyhow::Result;
use std::collections::HashMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DecompositionError {
    #[error("Failed to decompose task")]
    DecompositionFailed,
    #[error("Task too complex")]
    TooComplex,
}

/// Hierarchical task decomposer
pub struct TaskDecomposer {
    max_depth: usize,
}

impl TaskDecomposer {
    pub fn new() -> Self {
        Self { max_depth: 5 }
    }

    /// Decompose complex tasks into subtasks
    pub fn decompose(&self, task: &Task) -> Result<TaskTree> {
        let root = TaskNode {
            id: task.id.clone(),
            description: task.description.clone(),
            subtasks: vec![],
            priority: task.priority,
        };

        let tree = self.decompose_recursive(root, 0)?;
        Ok(TaskTree { root: tree })
    }

    /// Prioritize subtasks
    fn prioritize_subtasks(&self, subtasks: Vec<TaskNode>) -> Vec<TaskNode> {
        let mut prioritized = subtasks;
        prioritized.sort_by(|a, b| b.priority.cmp(&a.priority));
        prioritized
    }

    /// Create dependency graphs
    pub fn create_dependency_graph(&self, tree: &TaskTree) -> Result<DependencyGraph> {
        let mut graph = DependencyGraph::new();
        self.build_graph_recursive(&tree.root, &mut graph)?;
        Ok(graph)
    }

    /// Recursive decomposition
    fn decompose_recursive(&self, mut node: TaskNode, depth: usize) -> Result<TaskNode> {
        if depth >= self.max_depth {
            return Ok(node);
        }

        // This is a placeholder for more advanced decomposition logic.
        // A real implementation would use a planner, an LLM, or a rule-based system
        // to break down the goal into a more comprehensive graph of sub-tasks and actions.
        if node.description.to_lowercase().starts_with("search for") {
            if let Some(query) = node.description.split("search for").nth(1) {
                let query = query.trim().to_string();
                
                let type_subtask = TaskNode {
                    id: format!("{}-type", node.id),
                    description: format!("type '{}' in search bar", query),
                    subtasks: vec![],
                    priority: node.priority,
                };

                let click_subtask = TaskNode {
                    id: format!("{}-click", node.id),
                    description: "click search button".to_string(),
                    subtasks: vec![],
                    priority: node.priority,
                };
                
                node.subtasks.push(type_subtask);
                node.subtasks.push(click_subtask);
            }
        }

        // Recursively decompose subtasks
        let mut new_subtasks = vec![];
        for subtask in node.subtasks {
            new_subtasks.push(self.decompose_recursive(subtask, depth + 1)?);
        }
        node.subtasks = new_subtasks;
        
        Ok(node)
    }

    /// Build dependency graph recursively
    fn build_graph_recursive(&self, node: &TaskNode, graph: &mut DependencyGraph) -> Result<()> {
        for subtask in &node.subtasks {
            graph.add_dependency(&node.id, &subtask.id);
            self.build_graph_recursive(subtask, graph)?;
        }
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct Task {
    pub id: String,
    pub description: String,
    pub priority: u8,
}

#[derive(Debug, Clone)]
pub struct TaskTree {
    pub root: TaskNode,
}

#[derive(Debug, Clone)]
pub struct TaskNode {
    pub id: String,
    pub description: String,
    pub subtasks: Vec<TaskNode>,
    pub priority: u8,
}

#[derive(Debug, Clone)]
pub struct DependencyGraph {
    nodes: HashMap<String, Node>,
    edges: Vec<(String, String)>,
}

#[derive(Debug, Clone)]
pub struct Node {
    pub id: String,
    pub dependencies: Vec<String>,
}

impl DependencyGraph {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            edges: vec![],
        }
    }

    pub fn add_dependency(&mut self, from: &str, to: &str) {
        self.edges.push((from.to_string(), to.to_string()));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_decomposition() {
        let decomposer = TaskDecomposer::new();
        let task = Task {
            id: "task1".to_string(),
            description: "Complex task".to_string(),
            priority: 1,
        };
        let tree = decomposer.decompose(&task).unwrap();
        assert_eq!(tree.root.id, "task1");
    }
}
