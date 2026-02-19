use std::time::Duration;

#[derive(Debug, Clone)]
pub enum WaitCondition {
    ElementPresent { selector: String },
    ElementVisible { selector: String },
    ElementClickable { selector: String },
    ElementHidden { selector: String },
    UrlContains { fragment: String },
    UrlEquals { url: String },
    TitleContains { fragment: String },
    NetworkIdle,
    Custom { predicate: String },
}

#[derive(Debug, Clone)]
pub struct WaitStrategy {
    pub condition: WaitCondition,
    pub timeout: Duration,
    pub poll_interval: Duration,
}

impl WaitStrategy {
    pub fn new(condition: WaitCondition) -> Self {
        Self {
            condition,
            timeout: Duration::from_secs(30),
            poll_interval: Duration::from_millis(100),
        }
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn with_poll_interval(mut self, interval: Duration) -> Self {
        self.poll_interval = interval;
        self
    }
}

pub fn calculate_wait_timeout(custom_timeout_ms: Option<u64>, default_timeout_ms: u64) -> Duration {
    Duration::from_millis(custom_timeout_ms.unwrap_or(default_timeout_ms))
}
