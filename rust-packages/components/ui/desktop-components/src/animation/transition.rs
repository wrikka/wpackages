//! Transition utilities for smooth state changes
//! 
//! Provides transition animations between states

use crate::animation::easing::{Easing, EasingFn};
use std::time::{Duration, Instant};

/// Transition state
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TransitionState {
    Idle,
    Running,
    Completed,
}

/// Transition configuration
#[derive(Debug, Clone)]
pub struct TransitionConfig {
    /// Duration of the transition
    pub duration: Duration,
    /// Easing function
    pub easing: Easing,
    /// Delay before starting
    pub delay: Duration,
}

impl Default for TransitionConfig {
    fn default() -> Self {
        Self {
            duration: Duration::from_millis(300),
            easing: Easing::default(),
            delay: Duration::ZERO,
        }
    }
}

/// Transition between two values
pub struct Transition<T> {
    from: T,
    to: T,
    config: TransitionConfig,
    state: TransitionState,
    start_time: Option<Instant>,
}

impl<T> Transition<T>
where
    T: Clone + Copy,
{
    /// Create a new transition
    pub fn new(from: T, to: T, config: TransitionConfig) -> Self {
        Self {
            from,
            to,
            config,
            state: TransitionState::Idle,
            start_time: None,
        }
    }

    /// Start the transition
    pub fn start(&mut self) {
        self.state = TransitionState::Running;
        self.start_time = Some(Instant::now());
    }

    /// Get current value
    pub fn value(&self) -> Option<T>
    where
        T: std::ops::Sub<Output = T> + std::ops::Mul<Output = T>,
    {
        match self.state {
            TransitionState::Idle => Some(self.from),
            TransitionState::Running => {
                let start = self.start_time?;
                let elapsed = start.elapsed();
                
                if elapsed < self.config.delay {
                    Some(self.from)
                } else {
                    let progress = (elapsed - self.config.delay).as_secs_f32()
                        / self.config.duration.as_secs_f32();
                    
                    if progress >= 1.0 {
                        self.state = TransitionState::Completed;
                        Some(self.to)
                    } else {
                        let eased = (self.config.easing.function())(progress);
                        let diff = self.to - self.from;
                        Some(self.from + diff * eased)
                    }
                }
            }
            TransitionState::Completed => Some(self.to),
        }
    }

    /// Get current state
    pub fn state(&self) -> TransitionState {
        self.state
    }

    /// Check if completed
    pub fn is_completed(&self) -> bool {
        self.state == TransitionState::Completed
    }

    /// Check if running
    pub fn is_running(&self) -> bool {
        self.state == TransitionState::Running
    }
}

/// Float transition helper
pub fn transition_float(from: f32, to: f32, config: TransitionConfig) -> Transition<f32> {
    Transition::new(from, to, config)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transition() {
        let mut transition = Transition::new(
            0.0,
            100.0,
            TransitionConfig {
                duration: Duration::from_millis(100),
                easing: Easing::Linear,
                delay: Duration::ZERO,
            },
        );
        
        transition.start();
        assert!(transition.is_running());
        
        std::thread::sleep(Duration::from_millis(150));
        assert!(transition.is_completed());
        assert_eq!(transition.value(), Some(100.0));
    }
}
