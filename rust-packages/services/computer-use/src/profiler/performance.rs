//! Performance Profiler
//!
//! Tracks and analyzes performance metrics to identify bottlenecks
//! and suggest optimizations.

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use uuid::Uuid;

/// Performance profiler
pub struct PerformanceProfiler {
    sessions: Arc<Mutex<HashMap<String, ProfileSession>>>,
    active_spans: Arc<Mutex<HashMap<String, Span>>>,
    metrics: Arc<Mutex<MetricsStore>>,
    threshold_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileSession {
    pub id: String,
    pub name: String,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub spans: Vec<Span>,
    pub total_duration_ms: u64,
    pub slow_operations: Vec<SlowOperation>,
    pub bottlenecks: Vec<Bottleneck>,
    pub recommendations: Vec<Recommendation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Span {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub start_time: Instant,
    pub end_time: Option<Instant>,
    pub duration_ms: Option<u64>,
    pub metadata: HashMap<String, String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlowOperation {
    pub operation: String,
    pub duration_ms: u64,
    pub threshold_ms: u64,
    pub context: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bottleneck {
    pub component: String,
    pub impact_score: f64,
    pub description: String,
    pub frequency: u64,
    pub total_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub priority: Priority,
    pub category: String,
    pub description: String,
    pub estimated_improvement: String,
    pub implementation_difficulty: Difficulty,
    pub code_example: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, PartialOrd, Ord)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Difficulty {
    Easy,
    Medium,
    Hard,
}

#[derive(Debug, Clone)]
struct MetricsStore {
    operation_counts: HashMap<String, u64>,
    operation_durations: HashMap<String, Vec<u64>>,
    error_counts: HashMap<String, u64>,
}

impl PerformanceProfiler {
    pub fn new(threshold_ms: u64) -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            active_spans: Arc::new(Mutex::new(HashMap::new())),
            metrics: Arc::new(Mutex::new(MetricsStore {
                operation_counts: HashMap::new(),
                operation_durations: HashMap::new(),
                error_counts: HashMap::new(),
            })),
            threshold_ms,
        }
    }

    /// Start a profiling session
    pub async fn start_session(&self, name: &str) -> String {
        let id = Uuid::new_uuid().to_string();
        let session = ProfileSession {
            id: id.clone(),
            name: name.to_string(),
            start_time: current_timestamp(),
            end_time: None,
            spans: vec![],
            total_duration_ms: 0,
            slow_operations: vec![],
            bottlenecks: vec![],
            recommendations: vec![],
        };
        self.sessions.lock().await.insert(id.clone(), session);
        id
    }

    /// Start a span
    pub async fn start_span(&self, session_id: &str, name: &str, tags: Vec<String>) -> String {
        let span_id = Uuid::new_uuid().to_string();
        let span = Span {
            id: span_id.clone(),
            name: name.to_string(),
            parent_id: None,
            start_time: Instant::now(),
            end_time: None,
            duration_ms: None,
            metadata: HashMap::new(),
            tags,
        };

        self.active_spans.lock().await.insert(span_id.clone(), span.clone());

        if let Some(session) = self.sessions.lock().await.get_mut(session_id) {
            session.spans.push(span);
        }

        span_id
    }

    /// End a span
    pub async fn end_span(&self, span_id: &str) -> Result<u64> {
        let mut active = self.active_spans.lock().await;
        if let Some(span) = active.get_mut(span_id) {
            span.end_time = Some(Instant::now());
            let duration = span.start_time.elapsed().as_millis() as u64;
            span.duration_ms = Some(duration);

            // Check if slow
            if duration > self.threshold_ms {
                let slow_op = SlowOperation {
                    operation: span.name.clone(),
                    duration_ms: duration,
                    threshold_ms: self.threshold_ms,
                    context: span.metadata.clone(),
                };

                // Update metrics
                let mut metrics = self.metrics.lock().await;
                *metrics.operation_counts.entry(span.name.clone()).or_insert(0) += 1;
                metrics.operation_durations.entry(span.name.clone()).or_insert_with(Vec::new).push(duration);
            }

            active.remove(span_id);
            return Ok(duration);
        }
        Err(crate::error::Error::InvalidCommand("Span not found".to_string()))
    }

    /// End session and generate report
    pub async fn end_session(&self, session_id: &str) -> Result<ProfileSession> {
        let mut sessions = self.sessions.lock().await;
        let mut session = sessions.get_mut(session_id)
            .ok_or_else(|| crate::error::Error::InvalidCommand("Session not found".to_string()))?
            .clone();

        session.end_time = Some(current_timestamp());
        if let Some(first) = session.spans.first() {
            if let Some(last) = session.spans.last() {
                if let (Some(start), Some(end)) = (Some(&first.start_time), last.end_time) {
                    session.total_duration_ms = end.duration_since(*start).as_millis() as u64;
                }
            }
        }

        // Identify bottlenecks
        session.bottlenecks = self.identify_bottlenecks(&session).await;

        // Generate recommendations
        session.recommendations = self.generate_recommendations(&session).await;

        sessions.insert(session_id.to_string(), session.clone());
        Ok(session)
    }

    /// Get performance report
    pub async fn get_report(&self, session_id: &str) -> Option<ProfileSession> {
        self.sessions.lock().await.get(session_id).cloned()
    }

    /// Get performance summary
    pub async fn get_summary(&self) -> PerformanceSummary {
        let metrics = self.metrics.lock().await;
        let sessions = self.sessions.lock().await;

        let mut slowest_operations: Vec<(String, f64)> = metrics.operation_durations
            .iter()
            .map(|(name, durations)| {
                let avg = durations.iter().sum::<u64>() as f64 / durations.len() as f64;
                (name.clone(), avg)
            })
            .collect();
        slowest_operations.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

        PerformanceSummary {
            total_sessions: sessions.len(),
            total_operations: metrics.operation_counts.values().sum(),
            slowest_operations: slowest_operations.into_iter().take(10).collect(),
            error_count: metrics.error_counts.values().sum(),
        }
    }

    /// Profile a function execution
    pub async fn profile<F, Fut, T>(&self, session_id: &str, name: &str, f: F) -> T
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = T>,
    {
        let span_id = self.start_span(session_id, name, vec![]).await;
        let result = f().await;
        let _ = self.end_span(&span_id).await;
        result
    }

    async fn identify_bottlenecks(&self, session: &ProfileSession) -> Vec<Bottleneck> {
        let mut component_times: HashMap<String, (u64, u64)> = HashMap::new();

        for span in &session.spans {
            if let Some(duration) = span.duration_ms {
                let entry = component_times.entry(span.name.clone()).or_insert((0, 0));
                entry.0 += duration;
                entry.1 += 1;
            }
        }

        let total_time: u64 = component_times.values().map(|(t, _)| t).sum();

        component_times
            .into_iter()
            .filter(|(_, (time, _))| *time > self.threshold_ms)
            .map(|(name, (time, count))| Bottleneck {
                component: name,
                impact_score: if total_time > 0 { time as f64 / total_time as f64 } else { 0.0 },
                description: format!("Took {}ms ({} calls)", time, count),
                frequency: count,
                total_time_ms: time,
            })
            .collect()
    }

    async fn generate_recommendations(&self, session: &ProfileSession) -> Vec<Recommendation> {
        let mut recommendations = vec![];

        for bottleneck in &session.bottlenecks {
            if bottleneck.total_time_ms > 1000 {
                recommendations.push(Recommendation {
                    priority: Priority::High,
                    category: "Optimization".to_string(),
                    description: format!("{} is taking too long. Consider parallel execution or caching.", bottleneck.component),
                    estimated_improvement: format!("~{}ms", bottleneck.total_time_ms / 2),
                    implementation_difficulty: Difficulty::Medium,
                    code_example: None,
                });
            }
        }

        recommendations.sort_by(|a, b| b.priority.cmp(&a.priority));
        recommendations
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSummary {
    pub total_sessions: usize,
    pub total_operations: u64,
    pub slowest_operations: Vec<(String, f64)>,
    pub error_count: u64,
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
