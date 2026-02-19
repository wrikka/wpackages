use anyhow::Result;
use std::time::{Duration, Instant};

pub struct FocusModeService {
    is_active: bool,
    start_time: Option<Instant>,
    duration: Option<Duration>,
}

impl Default for FocusModeService {
    fn default() -> Self {
        Self::new()
    }
}

impl FocusModeService {
    pub fn new() -> Self {
        Self {
            is_active: false,
            start_time: None,
            duration: None,
        }
    }

    pub fn start_session(&mut self, duration_minutes: u64) {
        self.is_active = true;
        self.start_time = Some(Instant::now());
        self.duration = Some(Duration::from_secs(duration_minutes * 60));
        tracing::info!("Focus mode started for {} minutes.", duration_minutes);
        // In a real app, this would trigger UI changes (e.g., hide notifications, fullscreen)
    }

    pub fn stop_session(&mut self) {
        self.is_active = false;
        self.start_time = None;
        self.duration = None;
        tracing::info!("Focus mode stopped.");
        // Revert UI changes
    }

    pub fn is_active(&self) -> bool {
        self.is_active
    }

    pub fn time_remaining(&self) -> Option<Duration> {
        if let (Some(start), Some(duration)) = (self.start_time, self.duration) {
            let elapsed = start.elapsed();
            if elapsed < duration {
                return Some(duration - elapsed);
            }
        }
        None
    }
}
