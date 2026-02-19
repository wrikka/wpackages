//! Screen recording service

use async_trait::async_trait;
use std::path::PathBuf;
use crate::error::Result;

/// Recording service trait
#[async_trait]
pub trait RecordingService: Send + Sync {
    /// Start recording
    async fn start(&self, path: PathBuf) -> Result<()>;

    /// Stop recording
    async fn stop(&self) -> Result<PathBuf>;

    /// Check if recording is active
    fn is_recording(&self) -> bool;
}

/// Default recording service (placeholder)
pub struct DefaultRecordingService {
    recording: std::sync::Arc<tokio::sync::Mutex<bool>>,
    path: std::sync::Arc<tokio::sync::Mutex<Option<PathBuf>>>,
}

impl DefaultRecordingService {
    /// Create new recording service
    pub const fn new() -> Self {
        Self {
            recording: std::sync::Arc::new(tokio::sync::Mutex::new(false)),
            path: std::sync::Arc::new(tokio::sync::Mutex::new(None)),
        }
    }
}

impl Default for DefaultRecordingService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl RecordingService for DefaultRecordingService {
    async fn start(&self, path: PathBuf) -> Result<()> {
        let mut recording = self.recording.lock().await;
        let mut current_path = self.path.lock().await;
        *recording = true;
        *current_path = Some(path);
        Ok(())
    }

    async fn stop(&self) -> Result<PathBuf> {
        let mut recording = self.recording.lock().await;
        let mut path = self.path.lock().await;
        *recording = false;
        path.take()
            .ok_or_else(|| crate::error::Error::NoActiveRecording)
    }

    fn is_recording(&self) -> bool {
        futures::executor::block_on(async {
            *self.recording.lock().await
        })
    }
}
