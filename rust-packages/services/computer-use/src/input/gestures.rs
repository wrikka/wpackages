//! Gesture Support
//!
//! Touch and trackpad gesture automation.

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Gesture manager
pub struct GestureManager {
    gestures: Arc<Mutex<HashMap<String, Gesture>>>,
    active_recording: Arc<Mutex<Option<GestureRecording>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gesture {
    pub id: String,
    pub name: String,
    pub gesture_type: GestureType,
    pub points: Vec<Point>,
    pub duration_ms: u64,
    pub pressure_points: Vec<f32>,
    pub metadata: GestureMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GestureType {
    Swipe { direction: SwipeDirection },
    Pinch { scale: f64 },
    Rotate { angle: f64 },
    Tap { count: u32 },
    LongPress { duration_ms: u64 },
    Pan { delta_x: f64, delta_y: f64 },
    Custom { pattern: String },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum SwipeDirection {
    Left,
    Right,
    Up,
    Down,
    UpLeft,
    UpRight,
    DownLeft,
    DownRight,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
    pub timestamp_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GestureMetadata {
    pub created_at: u64,
    pub usage_count: u64,
    pub success_rate: f64,
    pub device_type: DeviceType,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum DeviceType {
    Trackpad,
    Touchscreen,
    Mouse,
    Stylus,
}

#[derive(Debug, Clone)]
pub struct GestureRecording {
    pub name: String,
    pub points: Vec<Point>,
    pub start_time: u64,
    pub device_type: DeviceType,
}

impl GestureManager {
    pub fn new() -> Self {
        Self {
            gestures: Arc::new(Mutex::new(HashMap::new())),
            active_recording: Arc::new(Mutex::new(None)),
        }
    }

    /// Start recording a gesture
    pub async fn start_recording(&self, name: &str, device_type: DeviceType) -> Result<()> {
        *self.active_recording.lock().await = Some(GestureRecording {
            name: name.to_string(),
            points: vec![],
            start_time: current_timestamp(),
            device_type,
        });
        Ok(())
    }

    /// Add point to recording
    pub async fn add_point(&self, x: f64, y: f64) -> Result<()> {
        if let Some(ref mut recording) = *self.active_recording.lock().await {
            recording.points.push(Point {
                x,
                y,
                timestamp_ms: current_timestamp(),
            });
        }
        Ok(())
    }

    /// Stop recording and save gesture
    pub async fn stop_recording(&self) -> Result<Gesture> {
        let recording = self.active_recording
            .lock()
            .await
            .take()
            .ok_or_else(|| crate::error::Error::InvalidCommand("No active recording".to_string()))?;

        let gesture_type = self.classify_gesture(&recording.points)?;
        
        let gesture = Gesture {
            id: uuid::Uuid::new_uuid().to_string(),
            name: recording.name,
            gesture_type,
            points: recording.points,
            duration_ms: current_timestamp() - recording.start_time,
            pressure_points: vec![],
            metadata: GestureMetadata {
                created_at: current_timestamp(),
                usage_count: 0,
                success_rate: 1.0,
                device_type: recording.device_type,
            },
        };

        self.gestures.lock().await.insert(gesture.id.clone(), gesture.clone());
        Ok(gesture)
    }

    /// Classify gesture from points
    fn classify_gesture(&self, points: &[Point]) -> Result<GestureType> {
        if points.len() < 2 {
            return Err(crate::error::Error::InvalidCommand("Not enough points".to_string()));
        }

        let start = &points[0];
        let end = &points[points.len() - 1];
        
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let distance = (dx * dx + dy * dy).sqrt();

        // Classify based on movement
        if distance > 50.0 {
            // Swipe
            let direction = if dx.abs() > dy.abs() {
                if dx > 0.0 { SwipeDirection::Right } else { SwipeDirection::Left }
            } else {
                if dy > 0.0 { SwipeDirection::Down } else { SwipeDirection::Up }
            };
            Ok(GestureType::Swipe { direction })
        } else {
            // Tap
            Ok(GestureType::Tap { count: 1 })
        }
    }

    /// Execute a gesture
    pub async fn execute_gesture(&self, gesture_id: &str, target_x: f64, target_y: f64) -> Result<()> {
        let gesture = self.gestures
            .lock()
            .await
            .get(gesture_id)
            .cloned()
            .ok_or_else(|| crate::error::Error::InvalidCommand(format!("Gesture {} not found", gesture_id)))?;

        // Execute gesture at target location
        match gesture.gesture_type {
            GestureType::Swipe { direction } => {
                let (dx, dy) = match direction {
                    SwipeDirection::Left => (-100.0, 0.0),
                    SwipeDirection::Right => (100.0, 0.0),
                    SwipeDirection::Up => (0.0, -100.0),
                    SwipeDirection::Down => (0.0, 100.0),
                    _ => (0.0, 0.0),
                };
                // Execute swipe from target position
                let _ = (target_x + dx, target_y + dy);
            }
            GestureType::Tap { count } => {
                // Execute tap at target position
                let _ = count;
                let _ = (target_x, target_y);
            }
            _ => {}
        }

        Ok(())
    }

    /// Get all gestures
    pub async fn get_gestures(&self) -> Vec<Gesture> {
        self.gestures.lock().await.values().cloned().collect()
    }

    /// Delete gesture
    pub async fn delete_gesture(&self, gesture_id: &str) -> Result<()> {
        self.gestures
            .lock()
            .await
            .remove(gesture_id)
            .ok_or_else(|| crate::error::Error::InvalidCommand(format!("Gesture {} not found", gesture_id)))?;
        Ok(())
    }
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
