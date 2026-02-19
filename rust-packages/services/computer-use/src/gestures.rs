//! Gesture Recognition
//!
//! Feature 7: Touch gesture recognition for mobile/tablet devices

use serde::{Deserialize, Serialize};
use crate::error::Result;
use crate::types::Position;

/// Gesture types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Gesture {
    Tap { position: Position },
    DoubleTap { position: Position },
    LongPress { position: Position, duration_ms: u64 },
    Swipe { start: Position, end: Position, velocity: f32 },
    Pinch { center: Position, scale: f32 },
    Rotate { center: Position, angle: f32 },
    Drag { start: Position, end: Position },
}

/// Gesture recognizer
pub struct GestureRecognizer {
    min_swipe_distance: f32,
    max_tap_duration_ms: u64,
    long_press_threshold_ms: u64,
    pinch_threshold: f32,
}

impl GestureRecognizer {
    /// Create new gesture recognizer
    pub fn new() -> Self {
        Self {
            min_swipe_distance: 50.0,
            max_tap_duration_ms: 200,
            long_press_threshold_ms: 500,
            pinch_threshold: 0.1,
        }
    }

    /// Recognize gesture from touch sequence
    pub fn recognize(&self, touches: &[TouchPoint]) -> Option<Gesture> {
        if touches.is_empty() {
            return None;
        }

        match touches.len() {
            1 => self.recognize_single_touch(touches),
            2 => self.recognize_multi_touch(touches),
            _ => None,
        }
    }

    /// Recognize single touch gesture
    fn recognize_single_touch(&self, touches: &[TouchPoint]) -> Option<Gesture> {
        let first = touches.first()?;
        let last = touches.last()?;

        let duration = last.timestamp_ms.saturating_sub(first.timestamp_ms);
        let distance = self.distance(&first.position, &last.position);

        // Check for tap
        if distance < self.min_swipe_distance && duration < self.max_tap_duration_ms {
            return Some(Gesture::Tap { position: first.position });
        }

        // Check for long press
        if distance < self.min_swipe_distance && duration >= self.long_press_threshold_ms {
            return Some(Gesture::LongPress {
                position: first.position,
                duration_ms: duration,
            });
        }

        // Check for double tap
        if distance < self.min_swipe_distance && duration < self.max_tap_duration_ms * 2 {
            return Some(Gesture::DoubleTap { position: first.position });
        }

        // Check for swipe
        if distance >= self.min_swipe_distance {
            let velocity = distance / duration as f32;
            return Some(Gesture::Swipe {
                start: first.position,
                end: last.position,
                velocity,
            });
        }

        None
    }

    /// Recognize multi-touch gesture
    fn recognize_multi_touch(&self, _touches: &[TouchPoint]) -> Option<Gesture> {
        // Simplified pinch detection
        None
    }

    /// Calculate distance between two points
    fn distance(&self, a: &Position, b: &Position) -> f32 {
        let dx = (b.x - a.x) as f32;
        let dy = (b.y - a.y) as f32;
        (dx * dx + dy * dy).sqrt()
    }

    /// Get swipe direction
    pub fn swipe_direction(&self, start: &Position, end: &Position) -> SwipeDirection {
        let dx = end.x - start.x;
        let dy = end.y - start.y;

        if dx.abs() > dy.abs() {
            if dx > 0 {
                SwipeDirection::Right
            } else {
                SwipeDirection::Left
            }
        } else {
            if dy > 0 {
                SwipeDirection::Down
            } else {
                SwipeDirection::Up
            }
        }
    }
}

impl Default for GestureRecognizer {
    fn default() -> Self {
        Self::new()
    }
}

/// Touch point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TouchPoint {
    pub position: Position,
    pub timestamp_ms: u64,
    pub pressure: Option<f32>,
}

/// Swipe direction
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SwipeDirection {
    Up,
    Down,
    Left,
    Right,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recognize_tap() {
        let recognizer = GestureRecognizer::new();
        let touches = vec![
            TouchPoint {
                position: Position::new(100, 100),
                timestamp_ms: 0,
                pressure: None,
            },
            TouchPoint {
                position: Position::new(102, 102),
                timestamp_ms: 100,
                pressure: None,
            },
        ];

        let gesture = recognizer.recognize(&touches);
        assert!(matches!(gesture, Some(Gesture::Tap { .. })));
    }

    #[test]
    fn test_swipe_direction() {
        let recognizer = GestureRecognizer::new();
        
        let dir = recognizer.swipe_direction(&Position::new(0, 0), &Position::new(100, 0));
        assert_eq!(dir, SwipeDirection::Right);
        
        let dir = recognizer.swipe_direction(&Position::new(0, 0), &Position::new(0, 100));
        assert_eq!(dir, SwipeDirection::Down);
    }
}
