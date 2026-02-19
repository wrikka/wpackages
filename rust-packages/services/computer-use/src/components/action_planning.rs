//! Action planning component (pure logic)
//!
//! Plans sequences of actions to achieve a goal.

use crate::types::{Action, TaskGoal, ActionPlan, PlannedAction};
use crate::error::{Error, Result};

/// Action planner (pure component)
pub struct ActionPlanner {
    max_steps: usize,
}

impl ActionPlanner {
    /// Create new action planner
    pub const fn new() -> Self {
        Self { max_steps: 100 }
    }

    /// Create with custom max steps
    pub const fn with_max_steps(max_steps: usize) -> Self {
        Self { max_steps }
    }

    /// Plan actions for a goal
    pub fn plan(&self, goal: &TaskGoal) -> Result<ActionPlan> {
        let actions = self.decompose_goal(goal);
        let estimated_steps = actions.len();

        if estimated_steps > self.max_steps {
            return Err(Error::InvalidCommand(format!(
                "Too many steps: {} exceeds maximum {}",
                estimated_steps, self.max_steps
            )));
        }

        Ok(ActionPlan {
            actions,
            estimated_steps,
        })
    }

    /// Decompose goal into actions
    fn decompose_goal(&self, goal: &TaskGoal) -> Vec<PlannedAction> {
        let mut actions = Vec::new();

        // Basic decomposition logic
        actions.push(PlannedAction {
            action: Action::Snapshot,
            description: format!("Take snapshot to understand current state for: {}", goal.description),
            dependencies: vec![],
        });

        actions
    }
}

impl Default for ActionPlanner {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plan_simple_goal() {
        let planner = ActionPlanner::new();
        let goal = TaskGoal {
            description: "Click on button".to_string(),
            target_state: "button clicked".to_string(),
        };
        let plan = planner.plan(&goal).unwrap();
        assert!(!plan.actions.is_empty());
    }
}
