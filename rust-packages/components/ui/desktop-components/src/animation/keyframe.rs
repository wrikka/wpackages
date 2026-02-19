//! Keyframe animation system
//! 
//! Provides keyframe-based animations with multiple properties

use crate::animation::easing::{Easing, EasingFn};
use std::time::{Duration, Instant};

/// Keyframe for animation
#[derive(Debug, Clone)]
pub struct Keyframe<T> {
    /// Time position (0.0 to 1.0)
    pub time: f32,
    /// Value at this keyframe
    pub value: T,
    /// Easing function to next keyframe
    pub easing: Option<Easing>,
}

/// Keyframe animation
pub struct KeyframeAnimation<T> {
    keyframes: Vec<Keyframe<T>>,
    duration: Duration,
    state: AnimationState,
    start_time: Option<Instant>,
    loop_animation: bool,
}

/// Animation state
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AnimationState {
    Idle,
    Running,
    Paused,
    Completed,
}

impl<T> KeyframeAnimation<T>
where
    T: Clone + Copy,
{
    /// Create a new keyframe animation
    pub fn new(keyframes: Vec<Keyframe<T>>, duration: Duration) -> Self {
        Self {
            keyframes,
            duration,
            state: AnimationState::Idle,
            start_time: None,
            loop_animation: false,
        }
    }

    /// Set whether to loop the animation
    pub fn loop_animation(mut self, loop_animation: bool) -> Self {
        self.loop_animation = loop_animation;
        self
    }

    /// Start the animation
    pub fn start(&mut self) {
        self.state = AnimationState::Running;
        self.start_time = Some(Instant::now());
    }

    /// Pause the animation
    pub fn pause(&mut self) {
        if self.state == AnimationState::Running {
            self.state = AnimationState::Paused;
        }
    }

    /// Resume the animation
    pub fn resume(&mut self) {
        if self.state == AnimationState::Paused {
            self.state = AnimationState::Running;
        }
    }

    /// Reset the animation
    pub fn reset(&mut self) {
        self.state = AnimationState::Idle;
        self.start_time = None;
    }

    /// Get current value
    pub fn value(&self) -> Option<T>
    where
        T: std::ops::Sub<Output = T> + std::ops::Mul<Output = T>,
    {
        match self.state {
            AnimationState::Idle => self.keyframes.first().map(|k| k.value),
            AnimationState::Running | AnimationState::Paused => {
                let start = self.start_time?;
                let elapsed = start.elapsed();
                let progress = elapsed.as_secs_f32() / self.duration.as_secs_f32();
                
                if progress >= 1.0 {
                    if self.loop_animation {
                        self.keyframes.first().map(|k| k.value)
                    } else {
                        self.state = AnimationState::Completed;
                        self.keyframes.last().map(|k| k.value)
                    }
                } else {
                    self.interpolate(progress)
                }
            }
            AnimationState::Completed => self.keyframes.last().map(|k| k.value),
        }
    }

    /// Interpolate value at progress
    fn interpolate(&self, progress: f32) -> Option<T>
    where
        T: std::ops::Sub<Output = T> + std::ops::Mul<Output = T>,
    {
        // Find keyframes surrounding progress
        for i in 0..self.keyframes.len().saturating_sub(1) {
            let current = &self.keyframes[i];
            let next = &self.keyframes[i + 1];
            
            if progress >= current.time && progress <= next.time {
                let local_progress = (progress - current.time) / (next.time - current.time);
                let easing = current.easing.unwrap_or_default();
                let eased = (easing.function())(local_progress);
                let diff = next.value - current.value;
                return Some(current.value + diff * eased);
            }
        }
        
        self.keyframes.first().map(|k| k.value)
    }

    /// Get current state
    pub fn state(&self) -> AnimationState {
        self.state
    }

    /// Check if completed
    pub fn is_completed(&self) -> bool {
        self.state == AnimationState::Completed
    }

    /// Check if running
    pub fn is_running(&self) -> bool {
        self.state == AnimationState::Running
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keyframe_animation() {
        let keyframes = vec![
            Keyframe {
                time: 0.0,
                value: 0.0,
                easing: None,
            },
            Keyframe {
                time: 1.0,
                value: 100.0,
                easing: None,
            },
        ];
        
        let mut animation = KeyframeAnimation::new(keyframes, Duration::from_millis(100));
        animation.start();
        
        std::thread::sleep(Duration::from_millis(50));
        let value = animation.value();
        assert!(value.is_some());
        assert!(value.unwrap() > 0.0 && value.unwrap() < 100.0);
    }
}
