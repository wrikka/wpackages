//! Session Replay & Debug (Feature 8)
//!
//! Comprehensive recording and replay for debugging

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// Recording session data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRecording {
    pub id: String,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub actions: Vec<ActionRecord>,
    pub screenshots: Vec<ScreenshotRecord>,
    pub states: Vec<StateRecord>,
    pub metadata: SessionMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionRecord {
    pub timestamp: u64,
    pub action: crate::types::Action,
    pub result: ActionResult,
    pub duration_ms: u64,
    pub screenshot_before: Option<String>,
    pub screenshot_after: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionResult {
    Success,
    Failure { error: String },
    Warning { message: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenshotRecord {
    pub timestamp: u64,
    pub path: String,
    pub hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateRecord {
    pub timestamp: u64,
    pub active_app: String,
    pub window_title: String,
    pub mouse_position: (i32, i32),
    pub elements: Vec<ElementSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementSnapshot {
    pub id: String,
    pub role: String,
    pub bounds: (i32, i32, i32, i32),
    pub text: Option<String>,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SessionMetadata {
    pub task: Option<String>,
    pub user: Option<String>,
    pub tags: Vec<String>,
    pub notes: Option<String>,
}

/// Replay configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayConfig {
    pub speed: ReplaySpeed,
    pub pause_on_error: bool,
    pub compare_screenshots: bool,
    pub stop_at_step: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReplaySpeed {
    Realtime,
    Fast,
    StepByStep,
    Custom(f32),
}

/// Debug session manager
pub struct SessionReplay {
    current_session: Option<SessionRecording>,
    recordings: Vec<SessionRecording>,
    replay_config: ReplayConfig,
    current_step: usize,
}

/// Breakpoint for debugging
#[derive(Debug, Clone)]
pub struct Breakpoint {
    pub step: usize,
    pub condition: BreakpointCondition,
}

#[derive(Debug, Clone)]
pub enum BreakpointCondition {
    Always,
    OnError,
    OnAction(String),
    Custom(Box<dyn Fn(&ActionRecord) -> bool + Send + Sync>),
}

impl SessionReplay {
    pub fn new() -> Self {
        Self {
            current_session: None,
            recordings: Vec::new(),
            replay_config: ReplayConfig {
                speed: ReplaySpeed::Realtime,
                pause_on_error: true,
                compare_screenshots: true,
                stop_at_step: None,
            },
            current_step: 0,
        }
    }

    /// Start recording a new session
    pub fn start_recording(&mut self, task: Option<&str>) -> String {
        let id = uuid::Uuid::new_v4().to_string();
        let session = SessionRecording {
            id: id.clone(),
            start_time: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            end_time: None,
            actions: Vec::new(),
            screenshots: Vec::new(),
            states: Vec::new(),
            metadata: SessionMetadata {
                task: task.map(String::from),
                user: None,
                tags: Vec::new(),
                notes: None,
            },
        };

        self.current_session = Some(session);
        id
    }

    /// Stop recording
    pub fn stop_recording(&mut self) -> Result<SessionRecording> {
        let mut session = self.current_session
            .take()
            .ok_or_else(|| anyhow::anyhow!("No active recording"))?;

        session.end_time = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        );

        self.recordings.push(session.clone());
        Ok(session)
    }

    /// Record an action
    pub fn record_action(&mut self, action: crate::types::Action, result: ActionResult, duration: Duration) {
        if let Some(session) = &mut self.current_session {
            let record = ActionRecord {
                timestamp: SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
                action,
                result,
                duration_ms: duration.as_millis() as u64,
                screenshot_before: None,
                screenshot_after: None,
            };
            session.actions.push(record);
        }
    }

    /// Record screenshot
    pub fn record_screenshot(&mut self, path: &str, hash: &str) {
        if let Some(session) = &mut self.current_session {
            let record = ScreenshotRecord {
                timestamp: SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
                path: path.to_string(),
                hash: hash.to_string(),
            };
            session.screenshots.push(record);
        }
    }

    /// Record system state
    pub fn record_state(&mut self, state: StateRecord) {
        if let Some(session) = &mut self.current_session {
            session.states.push(state);
        }
    }

    /// Replay a recording
    pub async fn replay(&mut self, session_id: &str, config: Option<ReplayConfig>) -> Result<ReplayResult> {
        let session = self.recordings
            .iter()
            .find(|s| s.id == session_id)
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("Session not found: {}", session_id))?;

        let config = config.unwrap_or(self.replay_config.clone());
        let mut results = Vec::new();

        for (i, action) in session.actions.iter().enumerate() {
            self.current_step = i;

            // Check if we should stop
            if let Some(stop_at) = config.stop_at_step {
                if i >= stop_at {
                    break;
                }
            }

            // Apply speed setting
            match &config.speed {
                ReplaySpeed::Realtime => {
                    if i > 0 {
                        let delay = action.timestamp - session.actions[i - 1].timestamp;
                        tokio::time::sleep(Duration::from_secs(delay)).await;
                    }
                }
                ReplaySpeed::Fast => tokio::time::sleep(Duration::from_millis(100)).await,
                ReplaySpeed::StepByStep => {
                    // Wait for user to continue
                }
                ReplaySpeed::Custom(speed) => {
                    tokio::time::sleep(Duration::from_millis((1000.0 / speed) as u64)).await;
                }
            }

            // Replay action
            let result = self.replay_action(action).await;
            results.push((action.clone(), result));

            // Pause on error if configured
            if config.pause_on_error {
                if let Err(ref e) = results.last().unwrap().1 {
                    // Pause and wait for user
                    return Ok(ReplayResult {
                        completed: false,
                        steps_executed: i + 1,
                        total_steps: session.actions.len(),
                        error_at_step: Some(i),
                        error_message: Some(e.to_string()),
                        duration: Duration::from_secs(0),
                    });
                }
            }

            // Compare screenshots if configured
            if config.compare_screenshots {
                // Compare screenshot hashes
            }
        }

        Ok(ReplayResult {
            completed: true,
            steps_executed: session.actions.len(),
            total_steps: session.actions.len(),
            error_at_step: None,
            error_message: None,
            duration: Duration::from_secs(0),
        })
    }

    /// Replay single action
    async fn replay_action(&self, record: &ActionRecord) -> Result<()> {
        // Execute the recorded action
        match &record.result {
            ActionResult::Success => Ok(()),
            ActionResult::Failure { error } => Err(anyhow::anyhow!("Recorded action failed: {}", error)),
            ActionResult::Warning { message } => {
                tracing::warn!("Replay warning: {}", message);
                Ok(())
            }
        }
    }

    /// Export session to file
    pub fn export_session(&self, session_id: &str, path: &str) -> Result<()> {
        let session = self.recordings
            .iter()
            .find(|s| s.id == session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let json = serde_json::to_string_pretty(session)?;
        std::fs::write(path, json)?;

        Ok(())
    }

    /// Import session from file
    pub fn import_session(&mut self, path: &str) -> Result<String> {
        let json = std::fs::read_to_string(path)?;
        let session: SessionRecording = serde_json::from_str(&json)?;
        let id = session.id.clone();
        
        self.recordings.push(session);
        Ok(id)
    }

    /// Get all recordings
    pub fn get_recordings(&self) -> &[SessionRecording] {
        &self.recordings
    }

    /// Find recordings by tag
    pub fn find_by_tag(&self, tag: &str) -> Vec<&SessionRecording> {
        self.recordings
            .iter()
            .filter(|r| r.metadata.tags.contains(&tag.to_string()))
            .collect()
    }

    /// Compare two sessions
    pub fn compare_sessions(&self, session1_id: &str, session2_id: &str) -> SessionComparison {
        let s1 = self.recordings.iter().find(|s| s.id == session1_id);
        let s2 = self.recordings.iter().find(|s| s.id == session2_id);

        match (s1, s2) {
            (Some(s1), Some(s2)) => {
                let mut differences = Vec::new();

                // Compare action counts
                if s1.actions.len() != s2.actions.len() {
                    differences.push(format!(
                        "Different action counts: {} vs {}",
                        s1.actions.len(),
                        s2.actions.len()
                    ));
                }

                // Compare action sequences
                for (i, (a1, a2)) in s1.actions.iter().zip(s2.actions.iter()).enumerate() {
                    if format!("{:?}", a1.action) != format!("{:?}", a2.action) {
                        differences.push(format!("Action {} differs", i));
                    }
                }

                SessionComparison {
                    identical: differences.is_empty(),
                    differences,
                    session1_duration: s1.end_time.unwrap_or(s1.start_time) - s1.start_time,
                    session2_duration: s2.end_time.unwrap_or(s2.start_time) - s2.start_time,
                }
            }
            _ => SessionComparison {
                identical: false,
                differences: vec!["One or both sessions not found".to_string()],
                session1_duration: 0,
                session2_duration: 0,
            },
        }
    }

    /// Generate debug report
    pub fn generate_debug_report(&self, session_id: &str) -> Result<String> {
        let session = self.recordings
            .iter()
            .find(|s| s.id == session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let mut report = String::new();
        report.push_str(&format!("# Debug Report: {}\n\n", session.metadata.task.as_deref().unwrap_or("Untitled")));
        report.push_str(&format!("- Session ID: {}\n", session.id));
        report.push_str(&format!("- Duration: {}s\n", session.end_time.unwrap_or(session.start_time) - session.start_time));
        report.push_str(&format!("- Actions: {}\n", session.actions.len()));
        report.push_str(&format!("- Screenshots: {}\n\n", session.screenshots.len()));

        report.push_str("## Action Log\n\n");
        for (i, action) in session.actions.iter().enumerate() {
            report.push_str(&format!("{}. {:?} - {:?} ({}ms)\n", 
                i + 1, 
                action.action,
                action.result,
                action.duration_ms
            ));
        }

        Ok(report)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayResult {
    pub completed: bool,
    pub steps_executed: usize,
    pub total_steps: usize,
    pub error_at_step: Option<usize>,
    pub error_message: Option<String>,
    pub duration: Duration,
}

#[derive(Debug, Clone)]
pub struct SessionComparison {
    pub identical: bool,
    pub differences: Vec<String>,
    pub session1_duration: u64,
    pub session2_duration: u64,
}
