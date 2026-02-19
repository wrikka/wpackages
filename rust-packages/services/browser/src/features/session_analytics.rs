use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsDashboard {
    pub sessions: Vec<SessionAnalytics>,
    pub overall_stats: OverallStats,
    pub time_range: (DateTime<Utc>, DateTime<Utc>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionAnalytics {
    pub session_id: String,
    pub browser_type: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: i64,
    pub pages_visited: Vec<PageVisit>,
    pub actions_performed: Vec<ActionRecord>,
    pub errors: Vec<ErrorRecord>,
    pub screenshots: Vec<ScreenshotRecord>,
    pub metrics: SessionMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageVisit {
    pub url: String,
    pub title: String,
    pub timestamp: DateTime<Utc>,
    pub load_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionRecord {
    pub action_type: String,
    pub target: Option<String>,
    pub success: bool,
    pub duration_ms: u64,
    pub timestamp: DateTime<Utc>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorRecord {
    pub error_type: String,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub context: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenshotRecord {
    pub path: String,
    pub timestamp: DateTime<Utc>,
    pub page_url: String,
    pub trigger: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMetrics {
    pub total_actions: u32,
    pub successful_actions: u32,
    pub failed_actions: u32,
    pub average_action_time_ms: f64,
    pub total_errors: u32,
    pub screenshots_taken: u32,
    pub pages_visited: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverallStats {
    pub total_sessions: u32,
    pub total_actions: u64,
    pub total_errors: u64,
    pub average_session_duration: f64,
    pub success_rate: f64,
    pub top_errors: Vec<ErrorSummary>,
    pub top_pages: Vec<PageSummary>,
    pub hourly_distribution: Vec<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorSummary {
    pub error_type: String,
    pub count: u32,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageSummary {
    pub url: String,
    pub visit_count: u32,
    pub average_load_time_ms: f64,
}

#[derive(Debug, Clone)]
pub struct SessionAnalyticsDashboard {
    sessions: HashMap<String, SessionAnalytics>,
}

impl SessionAnalyticsDashboard {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn start_session(&mut self, session_id: &str, browser_type: &str) {
        let analytics = SessionAnalytics {
            session_id: session_id.to_string(),
            browser_type: browser_type.to_string(),
            start_time: Utc::now(),
            end_time: None,
            duration_seconds: 0,
            pages_visited: Vec::new(),
            actions_performed: Vec::new(),
            errors: Vec::new(),
            screenshots: Vec::new(),
            metrics: SessionMetrics {
                total_actions: 0,
                successful_actions: 0,
                failed_actions: 0,
                average_action_time_ms: 0.0,
                total_errors: 0,
                screenshots_taken: 0,
                pages_visited: 0,
            },
        };

        self.sessions.insert(session_id.to_string(), analytics);
    }

    pub fn end_session(&mut self, session_id: &str) {
        if let Some(session) = self.sessions.get_mut(session_id) {
            session.end_time = Some(Utc::now());
            if let Some(end) = session.end_time {
                session.duration_seconds = end.signed_duration_since(session.start_time).num_seconds();
            }
        }
    }

    pub fn record_page_visit(&mut self, session_id: &str, url: &str, title: &str, load_time_ms: u64) {
        if let Some(session) = self.sessions.get_mut(session_id) {
            let visit = PageVisit {
                url: url.to_string(),
                title: title.to_string(),
                timestamp: Utc::now(),
                load_time_ms,
            };
            session.pages_visited.push(visit);
            session.metrics.pages_visited = session.pages_visited.len() as u32;
        }
    }

    pub fn record_action(&mut self, session_id: &str, action_type: &str, target: Option<&str>, success: bool, duration_ms: u64) {
        if let Some(session) = self.sessions.get_mut(session_id) {
            let action = ActionRecord {
                action_type: action_type.to_string(),
                target: target.map(|s| s.to_string()),
                success,
                duration_ms,
                timestamp: Utc::now(),
                error: None,
            };

            session.actions_performed.push(action);
            session.metrics.total_actions += 1;
            if success {
                session.metrics.successful_actions += 1;
            } else {
                session.metrics.failed_actions += 1;
            }

            let total_time: u64 = session.actions_performed.iter().map(|a| a.duration_ms).sum();
            session.metrics.average_action_time_ms = total_time as f64 / session.metrics.total_actions as f64;
        }
    }

    pub fn record_error(&mut self, session_id: &str, error_type: &str, message: &str, context: HashMap<String, String>) {
        if let Some(session) = self.sessions.get_mut(session_id) {
            let error = ErrorRecord {
                error_type: error_type.to_string(),
                message: message.to_string(),
                timestamp: Utc::now(),
                context,
            };

            session.errors.push(error);
            session.metrics.total_errors += 1;
        }
    }

    pub fn record_screenshot(&mut self, session_id: &str, path: &str, page_url: &str, trigger: &str) {
        if let Some(session) = self.sessions.get_mut(session_id) {
            let screenshot = ScreenshotRecord {
                path: path.to_string(),
                timestamp: Utc::now(),
                page_url: page_url.to_string(),
                trigger: trigger.to_string(),
            };

            session.screenshots.push(screenshot);
            session.metrics.screenshots_taken += 1;
        }
    }

    pub fn get_session(&self, session_id: &str) -> Option<&SessionAnalytics> {
        self.sessions.get(session_id)
    }

    pub fn generate_dashboard(&self, from: DateTime<Utc>, to: DateTime<Utc>) -> AnalyticsDashboard {
        let filtered_sessions: Vec<SessionAnalytics> = self.sessions.values()
            .filter(|s| s.start_time >= from && s.start_time <= to)
            .cloned()
            .collect();

        let overall_stats = self.calculate_overall_stats(&filtered_sessions);

        AnalyticsDashboard {
            sessions: filtered_sessions,
            overall_stats,
            time_range: (from, to),
        }
    }

    fn calculate_overall_stats(&self, sessions: &[SessionAnalytics]) -> OverallStats {
        let total_sessions = sessions.len() as u32;
        let total_actions: u64 = sessions.iter().map(|s| s.metrics.total_actions as u64).sum();
        let total_errors: u64 = sessions.iter().map(|s| s.metrics.total_errors as u64).sum();
        
        let total_duration: i64 = sessions.iter()
            .map(|s| s.duration_seconds)
            .sum();
        let avg_duration = if total_sessions > 0 {
            total_duration as f64 / total_sessions as f64
        } else {
            0.0
        };

        let success_rate = if total_actions > 0 {
            let successful: u64 = sessions.iter().map(|s| s.metrics.successful_actions as u64).sum();
            (successful as f64 / total_actions as f64) * 100.0
        } else {
            100.0
        };

        let mut error_counts: HashMap<String, u32> = HashMap::new();
        for session in sessions {
            for error in &session.errors {
                *error_counts.entry(error.error_type.clone()).or_insert(0) += 1;
            }
        }

        let mut top_errors: Vec<ErrorSummary> = error_counts.into_iter()
            .map(|(error_type, count)| {
                let percentage = if total_errors > 0 {
                    (count as f64 / total_errors as f64) * 100.0
                } else {
                    0.0
                };
                ErrorSummary { error_type, count, percentage }
            })
            .collect();
        top_errors.sort_by(|a, b| b.count.cmp(&a.count));
        top_errors.truncate(10);

        let mut hourly_distribution = vec![0u32; 24];
        for session in sessions {
            let hour = session.start_time.hour() as usize;
            if hour < 24 {
                hourly_distribution[hour] += 1;
            }
        }

        OverallStats {
            total_sessions,
            total_actions,
            total_errors,
            average_session_duration: avg_duration,
            success_rate,
            top_errors,
            top_pages: Vec::new(),
            hourly_distribution,
        }
    }

    pub fn export_to_json(&self) -> String {
        let dashboard = self.generate_dashboard(
            Utc::now() - Duration::days(30),
            Utc::now()
        );
        serde_json::to_string_pretty(&dashboard).unwrap_or_default()
    }
}
