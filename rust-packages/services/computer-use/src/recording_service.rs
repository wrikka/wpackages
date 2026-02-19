//! Visual Recording & Replay
//!
//! Feature 2: Record and replay automation sequences

use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use crate::error::{Error, Result};
use crate::types::{Action, Command, Position};

/// Recording session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recording {
    pub id: String,
    pub name: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub duration_ms: u64,
    pub frames: Vec<RecordedFrame>,
    pub actions: Vec<RecordedAction>,
}

/// A single recorded frame
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedFrame {
    pub timestamp_ms: u64,
    pub screenshot_path: PathBuf,
    pub mouse_position: Position,
    pub active_window: Option<String>,
}

/// A recorded action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedAction {
    pub timestamp_ms: u64,
    pub action: Action,
    pub params: serde_json::Value,
    pub result: ActionResult,
}

/// Action result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionResult {
    Success,
    Failure(String),
}

/// Recording service
pub struct RecordingService {
    recordings_dir: PathBuf,
    active_recording: Option<ActiveRecording>,
}

/// Active recording state
struct ActiveRecording {
    id: String,
    start_time: Instant,
    frames: Vec<RecordedFrame>,
    actions: Vec<RecordedAction>,
    output_path: PathBuf,
}

impl RecordingService {
    /// Create new recording service
    pub fn new(recordings_dir: impl AsRef<Path>) -> Self {
        Self {
            recordings_dir: recordings_dir.as_ref().to_path_buf(),
            active_recording: None,
        }
    }

    /// Create with default directory
    pub fn default_dir() -> Self {
        Self::new("recordings")
    }

    /// Start a new recording
    pub fn start(&mut self, _name: &str) -> Result<String> {
        if self.active_recording.is_some() {
            return Err(Error::Recording("Recording already in progress".to_string()));
        }

        let id = uuid::Uuid::new_v4().to_string();
        let output_path = self.recordings_dir.join(format!("{}.json", id));

        self.active_recording = Some(ActiveRecording {
            id: id.clone(),
            start_time: Instant::now(),
            frames: Vec::new(),
            actions: Vec::new(),
            output_path,
        });

        Ok(id)
    }

    /// Stop current recording
    pub fn stop(&mut self) -> Result<Recording> {
        let active = self.active_recording.take()
            .ok_or(Error::NoActiveRecording)?;

        let duration_ms = active.start_time.elapsed().as_millis() as u64;

        let recording = Recording {
            id: active.id.clone(),
            name: active.id.clone(),
            created_at: chrono::Utc::now(),
            duration_ms,
            frames: active.frames,
            actions: active.actions,
        };

        // Save recording
        self.save_recording(&recording, &active.output_path)?;

        Ok(recording)
    }

    /// Record a frame
    pub fn record_frame(&mut self, frame: RecordedFrame) -> Result<()> {
        let active = self.active_recording.as_mut()
            .ok_or(Error::NoActiveRecording)?;
        active.frames.push(frame);
        Ok(())
    }

    /// Record an action
    pub fn record_action(&mut self, action: RecordedAction) -> Result<()> {
        let active = self.active_recording.as_mut()
            .ok_or(Error::NoActiveRecording)?;
        active.actions.push(action);
        Ok(())
    }

    /// Check if recording is active
    pub fn is_recording(&self) -> bool {
        self.active_recording.is_some()
    }

    /// Save recording to file
    fn save_recording(&self, recording: &Recording, path: &Path) -> Result<()> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| Error::Recording(e.to_string()))?;
        }

        let json = serde_json::to_string_pretty(recording)
            .map_err(|e| Error::Recording(e.to_string()))?;

        std::fs::write(path, json)
            .map_err(|e| Error::Recording(e.to_string()))
    }

    /// Load recording from file
    pub fn load(&self, id: &str) -> Result<Recording> {
        let path = self.recordings_dir.join(format!("{}.json", id));
        let json = std::fs::read_to_string(&path)
            .map_err(|e| Error::Recording(format!("Failed to load recording: {}", e)))?;

        serde_json::from_str(&json)
            .map_err(|e| Error::Recording(e.to_string()))
    }

    /// List all recordings
    pub fn list(&self) -> Result<Vec<Recording>> {
        if !self.recordings_dir.exists() {
            return Ok(Vec::new());
        }

        let mut recordings = Vec::new();
        for entry in std::fs::read_dir(&self.recordings_dir)
            .map_err(|e| Error::Recording(e.to_string()))?
        {
            let entry = entry.map_err(|e| Error::Recording(e.to_string()))?;
            if entry.path().extension().map(|e| e == "json").unwrap_or(false) {
                if let Ok(json) = std::fs::read_to_string(entry.path()) {
                    if let Ok(recording) = serde_json::from_str::<Recording>(&json) {
                        recordings.push(recording);
                    }
                }
            }
        }

        Ok(recordings)
    }
}

/// Replay service
pub struct ReplayService {
    speed: f32,
    pause_on_error: bool,
}

impl ReplayService {
    /// Create new replay service
    pub const fn new() -> Self {
        Self {
            speed: 1.0,
            pause_on_error: true,
        }
    }

    /// Set replay speed
    pub const fn with_speed(mut self, speed: f32) -> Self {
        self.speed = speed;
        self
    }

    /// Set pause on error
    pub const fn with_pause_on_error(mut self, pause: bool) -> Self {
        self.pause_on_error = pause;
        self
    }

    /// Calculate delay for action
    fn calculate_delay(&self, prev_ms: u64, current_ms: u64) -> Duration {
        let diff = current_ms.saturating_sub(prev_ms) as f64 / self.speed as f64;
        Duration::from_millis(diff as u64)
    }
}

impl Default for ReplayService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recording_service() {
        let service = RecordingService::default_dir();
        assert!(!service.is_recording());
    }

    #[test]
    fn test_start_stop_recording() {
        let mut service = RecordingService::default_dir();
        let id = service.start("test").unwrap();
        assert!(service.is_recording());
        let recording = service.stop().unwrap();
        assert_eq!(recording.id, id);
    }
}
