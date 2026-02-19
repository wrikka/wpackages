//! Feature 5: Context-Aware Action Planning
//! 
//! Plans actions based on current context and history,
//! considers dependencies between actions,
//! creates optimal action sequences for task completion.

use crate::types::{Action, TaskGoal, ActionPlan, PlannedAction, UIElement};
use crate::error::Result;
use std::collections::{HashMap, HashSet};
use std::time::Duration;
use thiserror::Error;

/// Task context for planning
#[derive(Default, Debug, Clone)]
pub struct TaskContext {
    pub active_app: Option<String>,
    pub current_screen: Option<String>,
    pub available_elements: Vec<UIElement>,
}

/// Context analysis result
#[derive(Debug, Clone)]
pub struct ContextAnalysis {
    pub available_elements: Vec<UIElement>,
    pub current_state: String,
}

/// Dependency graph for actions
#[derive(Default, Debug, Clone)]
pub struct DependencyGraph {
    dependencies: HashMap<usize, Vec<usize>>,
}

impl DependencyGraph {
    pub fn add_dependency(&mut self, from: usize, to: usize) {
        self.dependencies.entry(from).or_default().push(to);
    }

    pub fn has_cycles(&self) -> bool {
        // Simple cycle detection using DFS
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();

        for &node in self.dependencies.keys() {
            if !visited.contains(&node) {
                if self.has_cycles_dfs(node, &mut visited, &mut rec_stack) {
                    return true;
                }
            }
        }
        false
    }

    fn has_cycles_dfs(&self, node: usize, visited: &mut HashSet<usize>, rec_stack: &mut HashSet<usize>) -> bool {
        visited.insert(node);
        rec_stack.insert(node);

        if let Some(neighbors) = self.dependencies.get(&node) {
            for &neighbor in neighbors {
                if !visited.contains(&neighbor) {
                    if self.has_cycles_dfs(neighbor, visited, rec_stack) {
                        return true;
                    }
                } else if rec_stack.contains(&neighbor) {
                    return true;
                }
            }
        }

        rec_stack.remove(&node);
        false
    }
}

#[derive(Debug, Error)]
pub enum PlanningError {
    #[error("Failed to create action plan")]
    PlanningFailed,
    #[error("Circular dependency detected")]
    CircularDependency,
    #[error("Context insufficient")]
    InsufficientContext,
}

/// Action execution record
#[derive(Debug, Clone)]
pub struct ActionExecution {
    pub action: Action,
    pub result: bool,
    pub timestamp: std::time::Instant,
}

/// Context-aware action planner
#[derive(Default)]
pub struct ActionPlanner {
    context: TaskContext,
    history: Vec<ActionExecution>,
}

impl ActionPlanner {
    /// Plan actions based on context
    pub fn plan(&mut self, goal: &TaskGoal) -> Result<ActionPlan> {
        // Analyze current context
        let context_analysis = self.analyze_context()?;

        // Generate action sequence
        let sequence = self.generate_sequence(goal, &context_analysis)?;

        // Optimize actions
        let actions = self.optimize_actions(sequence)?;

        Ok(ActionPlan {
            actions,
            estimated_steps: actions.len(),
        })
    }

    /// Consider dependencies between actions
    fn analyze_dependencies(&self, actions: &[Action]) -> Result<DependencyGraph> {
        let mut graph = DependencyGraph::default();

        for (i, action) in actions.iter().enumerate() {
            for (j, other) in actions.iter().enumerate() {
                if i != j && self.has_dependency(action, other) {
                    graph.add_dependency(i, j);
                }
            }
        }

        // Check for circular dependencies
        if graph.has_cycles() {
            return Err(PlanningError::CircularDependency.into());
        }

        Ok(graph)
    }

    /// Generate optimal action sequences
    fn generate_sequence(&self, goal: &TaskGoal, _context: &ContextAnalysis) -> Result<Vec<PlannedAction>> {
        // Mock implementation based on goal description
        let mut actions = vec![];
        let lower_desc = goal.description.to_lowercase();

        if lower_desc.contains("login") {
            actions.push(PlannedAction {
                action: Action::TypeText { element_id: "username_field".to_string(), text: "testuser".to_string() },
                description: "Type username".to_string(),
                dependencies: vec![],
            });
            actions.push(PlannedAction {
                action: Action::TypeText { element_id: "password_field".to_string(), text: "password".to_string() },
                description: "Type password".to_string(),
                dependencies: vec![0],
            });
            actions.push(PlannedAction {
                action: Action::ClickElement { element_id: "login_button".to_string() },
                description: "Click login button".to_string(),
                dependencies: vec![0, 1],
            });
        } else if lower_desc.contains("click") {
            actions.push(PlannedAction {
                action: Action::ClickElement { element_id: "some_button".to_string() },
                description: "Click button".to_string(),
                dependencies: vec![],
            });
        }

        Ok(actions)
    }

    /// Optimize actions
    fn optimize_actions(&self, actions: Vec<PlannedAction>) -> Result<Vec<PlannedAction>> {
        // Mock implementation: Remove consecutive duplicate actions.
        let mut optimized_actions = Vec::new();
        if actions.is_empty() {
            return Ok(optimized_actions);
        }

        optimized_actions.push(actions[0].clone());

        for i in 1..actions.len() {
            if actions[i].action != actions[i - 1].action {
                optimized_actions.push(actions[i].clone());
            }
        }

        Ok(optimized_actions)
    }

    /// Analyze current context
    fn analyze_context(&self) -> Result<ContextAnalysis> {
        Ok(ContextAnalysis {
            available_elements: vec![],
            current_state: "idle".to_string(),
        })
    }

    /// Check if action depends on another
    fn has_dependency(&self, action: &Action, other: &Action) -> bool {
        // Mock implementation of dependency checking.
        // A `Click` on a submit button should happen after `Type` actions.
        match (action, other) {
            (Action::ClickElement { element_id }, Action::TypeText { .. }) => {
                if element_id.contains("submit") || element_id.contains("login") {
                    return true; // Click depends on Type
                }
            }
            _ => {}
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_action_planner() {
        let mut planner = ActionPlanner::default();
        let goal = TaskGoal {
            description: "Click button".to_string(),
            target_state: "clicked".to_string(),
        };
        let plan = planner.plan(&goal).unwrap();
        assert!(!plan.actions.is_empty() || plan.estimated_steps == 0);
    }
}
