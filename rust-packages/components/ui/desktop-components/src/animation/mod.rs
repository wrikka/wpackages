//! Animation system for smooth transitions and effects
//! 
//! Provides a comprehensive animation framework with easing functions,
//! transitions, and keyframe animations

pub mod easing;
pub mod transition;
pub mod keyframe;
pub mod spring;

pub use easing::*;
pub use transition::*;
pub use keyframe::*;
pub use spring::*;
