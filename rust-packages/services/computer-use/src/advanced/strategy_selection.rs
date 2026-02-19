//! Feature 17: Dynamic Strategy Selection
//! 
//! Selects appropriate strategies based on task type,
//! balances exploration vs exploitation,
//! adapts according to constraints and requirements.

use anyhow::Result;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StrategyError {
    #[error("Strategy selection failed")]
    SelectionFailed,
    #[error("No suitable strategy found")]
    NoStrategyFound,
}

/// Strategy type
#[derive(Debug, Clone)]
pub enum Strategy {
    Conservative,
    Balanced,
    Aggressive,
    Adaptive,
}

/// Dynamic strategy selector
pub struct StrategySelector {
    current_strategy: Strategy,
    performance_history: Vec<StrategyPerformance>,
}

impl StrategySelector {
    pub fn new() -> Self {
        Self {
            current_strategy: Strategy::Balanced,
            performance_history: vec![],
        }
    }

    /// Select appropriate strategies based on task type
    pub fn select_strategy(&mut self, task: &Task) -> Result<Strategy> {
        let strategy = match task.task_type {
            TaskType::Simple => Strategy::Conservative,
            TaskType::Complex => Strategy::Balanced,
            TaskType::Dynamic => Strategy::Adaptive,
            TaskType::Urgent => Strategy::Aggressive,
        };

        self.current_strategy = strategy.clone();
        Ok(strategy)
    }

    /// Balance exploration vs exploitation
    pub fn balance_exploration(&self, exploration_rate: f32) -> Decision {
        if exploration_rate > 0.5 {
            Decision::Explore
        } else {
            Decision::Exploit
        }
    }

    /// Adapt according to constraints and requirements
    pub fn adapt(&mut self, constraints: &Constraints) -> Result<()> {
        if constraints.time_limit < Duration::from_secs(5) {
            self.current_strategy = Strategy::Aggressive;
        } else if constraints.accuracy_required > 0.9 {
            self.current_strategy = Strategy::Conservative;
        } else {
            self.current_strategy = Strategy::Balanced;
        }
        Ok(())
    }

    /// Update performance history
    pub fn update_performance(&mut self, performance: StrategyPerformance) {
        self.performance_history.push(performance);
    }
}

#[derive(Debug, Clone)]
pub struct Task {
    pub id: String,
    pub task_type: TaskType,
}

#[derive(Debug, Clone)]
pub enum TaskType {
    Simple,
    Complex,
    Dynamic,
    Urgent,
}

#[derive(Debug, Clone)]
pub enum Decision {
    Explore,
    Exploit,
}

#[derive(Debug, Clone)]
pub struct Constraints {
    pub time_limit: Duration,
    pub accuracy_required: f32,
}

#[derive(Debug, Clone)]
pub struct StrategyPerformance {
    pub strategy: Strategy,
    pub success_rate: f32,
    pub efficiency: f32,
}

use std::time::Duration;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strategy_selector() {
        let mut selector = StrategySelector::new();
        let task = Task {
            id: "task1".to_string(),
            task_type: TaskType::Simple,
        };
        let strategy = selector.select_strategy(&task).unwrap();
        matches!(strategy, Strategy::Conservative);
    }
}
