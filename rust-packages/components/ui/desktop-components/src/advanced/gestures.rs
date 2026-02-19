//! Touch gestures support
//! 
//! Provides touch gesture recognition for mobile and touch devices

/// Gesture type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GestureType {
    Tap,
    DoubleTap,
    LongPress,
    SwipeLeft,
    SwipeRight,
    SwipeUp,
    SwipeDown,
    Pinch,
    Rotate,
}

/// Gesture event
#[derive(Debug, Clone)]
pub struct GestureEvent {
    pub gesture_type: GestureType,
    pub position: (f32, f32),
    pub velocity: Option<(f32, f32)>,
    pub scale: Option<f32>,
    pub rotation: Option<f32>,
}

/// Gesture recognizer
pub struct GestureRecognizer {
    tap_threshold: f32,
    long_press_duration: std::time::Duration,
    swipe_threshold: f32,
    last_tap_time: Option<std::time::Instant>,
    tap_count: u32,
}

impl GestureRecognizer {
    /// Create a new gesture recognizer
    pub fn new() -> Self {
        Self {
            tap_threshold: 10.0,
            long_press_duration: std::time::Duration::from_millis(500),
            swipe_threshold: 50.0,
            last_tap_time: None,
            tap_count: 0,
        }
    }

    /// Recognize tap gesture
    pub fn recognize_tap(&mut self, start_pos: (f32, f32), end_pos: (f32, f32)) -> Option<GestureEvent> {
        let dx = (start_pos.0 - end_pos.0).abs();
        let dy = (start_pos.1 - end_pos.1).abs();
        
        if dx < self.tap_threshold && dy < self.tap_threshold {
            let now = std::time::Instant::now();
            
            // Check for double tap
            if let Some(last_time) = self.last_tap_time {
                if now.duration_since(last_time) < std::time::Duration::from_millis(300) {
                    self.tap_count += 1;
                } else {
                    self.tap_count = 1;
                }
            } else {
                self.tap_count = 1;
            }
            
            self.last_tap_time = Some(now);
            
            Some(GestureEvent {
                gesture_type: if self.tap_count >= 2 {
                    GestureType::DoubleTap
                } else {
                    GestureType::Tap
                },
                position: end_pos,
                velocity: None,
                scale: None,
                rotation: None,
            })
        } else {
            None
        }
    }

    /// Recognize swipe gesture
    pub fn recognize_swipe(
        &self,
        start_pos: (f32, f32),
        end_pos: (f32, f32),
        duration: std::time::Duration,
    ) -> Option<GestureEvent> {
        let dx = end_pos.0 - start_pos.0;
        let dy = end_pos.1 - start_pos.1;
        let distance = (dx * dx + dy * dy).sqrt();
        
        if distance >= self.swipe_threshold {
            let dt = duration.as_secs_f32();
            let velocity_x = dx / dt;
            let velocity_y = dy / dt;
            
            let gesture_type = if dx.abs() > dy.abs() {
                if dx > 0.0 {
                    GestureType::SwipeRight
                } else {
                    GestureType::SwipeLeft
                }
            } else {
                if dy > 0.0 {
                    GestureType::SwipeDown
                } else {
                    GestureType::SwipeUp
                }
            };
            
            Some(GestureEvent {
                gesture_type,
                position: end_pos,
                velocity: Some((velocity_x, velocity_y)),
                scale: None,
                rotation: None,
            })
        } else {
            None
        }
    }
}

impl Default for GestureRecognizer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tap_recognition() {
        let mut recognizer = GestureRecognizer::new();
        let gesture = recognizer.recognize_tap((0.0, 0.0), (5.0, 5.0));
        assert!(gesture.is_some());
        assert_eq!(gesture.unwrap().gesture_type, GestureType::Tap);
    }
}
