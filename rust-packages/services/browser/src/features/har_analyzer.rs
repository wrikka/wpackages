use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarEntry {
    pub started_date_time: String,
    pub time: f64,
    pub request: HarRequest,
    pub response: HarResponse,
    pub cache: Option<HashMap<String, String>>,
    pub timings: HarTimings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HarHeader>,
    pub query_string: Vec<HarQueryParam>,
    pub post_data: Option<HarPostData>,
    pub body_size: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<HarHeader>,
    pub content: HarContent,
    pub body_size: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarHeader {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarQueryParam {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarPostData {
    pub mime_type: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarContent {
    pub size: i64,
    pub mime_type: String,
    pub text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarTimings {
    pub blocked: f64,
    pub dns: f64,
    pub connect: f64,
    pub send: f64,
    pub wait: f64,
    pub receive: f64,
    pub ssl: f64,
}

#[derive(Debug, Clone)]
pub struct HarAnalyzer {
    entries: Vec<HarEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceAnalysis {
    pub total_requests: usize,
    pub total_transfer_size: i64,
    pub total_time_ms: f64,
    pub slowest_requests: Vec<SlowRequest>,
    pub largest_requests: Vec<LargeRequest>,
    pub error_requests: Vec<ErrorRequest>,
    pub cache_efficiency: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlowRequest {
    pub url: String,
    pub method: String,
    pub time_ms: f64,
    pub timings: HarTimings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LargeRequest {
    pub url: String,
    pub method: String,
    pub size_bytes: i64,
    pub content_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorRequest {
    pub url: String,
    pub method: String,
    pub status: u16,
    pub status_text: String,
}

impl HarAnalyzer {
    pub fn new(entries: Vec<HarEntry>) -> Self {
        Self { entries }
    }

    pub fn analyze(&self) -> PerformanceAnalysis {
        let total_requests = self.entries.len();
        let total_transfer_size: i64 = self.entries.iter().map(|e| e.response.body_size).sum();
        let total_time_ms: f64 = self.entries.iter().map(|e| e.time).sum();

        let mut sorted_by_time = self.entries.clone();
        sorted_by_time.sort_by(|a, b| b.time.partial_cmp(&a.time).unwrap());
        let slowest_requests: Vec<SlowRequest> = sorted_by_time.iter().take(10).map(|e| {
            SlowRequest {
                url: e.request.url.clone(),
                method: e.request.method.clone(),
                time_ms: e.time,
                timings: e.timings.clone(),
            }
        }).collect();

        let mut sorted_by_size = self.entries.clone();
        sorted_by_size.sort_by(|a, b| b.response.body_size.cmp(&a.response.body_size));
        let largest_requests: Vec<LargeRequest> = sorted_by_size.iter().take(10).map(|e| {
            LargeRequest {
                url: e.request.url.clone(),
                method: e.request.method.clone(),
                size_bytes: e.response.body_size,
                content_type: e.response.content.mime_type.clone(),
            }
        }).collect();

        let error_requests: Vec<ErrorRequest> = self.entries.iter()
            .filter(|e| e.response.status >= 400)
            .map(|e| ErrorRequest {
                url: e.request.url.clone(),
                method: e.request.method.clone(),
                status: e.response.status,
                status_text: e.response.status_text.clone(),
            })
            .collect();

        let cached_count = self.entries.iter().filter(|e| e.cache.is_some()).count();
        let cache_efficiency = if total_requests > 0 {
            (cached_count as f64 / total_requests as f64) * 100.0
        } else {
            0.0
        };

        PerformanceAnalysis {
            total_requests,
            total_transfer_size,
            total_time_ms,
            slowest_requests,
            largest_requests,
            error_requests,
            cache_efficiency,
        }
    }

    pub fn find_bottlenecks(&self) -> Vec<String> {
        let mut issues = Vec::new();
        let analysis = self.analyze();

        if analysis.total_time_ms > 5000.0 {
            issues.push(format!("Total page load time is slow: {:.0}ms", analysis.total_time_ms));
        }

        if analysis.total_transfer_size > 5_000_000 {
            issues.push(format!("Total transfer size is large: {:.2}MB", analysis.total_transfer_size as f64 / 1_000_000.0));
        }

        let total_requests = self.entries.len();
        if total_requests > 100 {
            issues.push(format!("High number of HTTP requests: {}", total_requests));
        }

        let http2_count = self.entries.iter()
            .filter(|e| e.request.headers.iter().any(|h| h.name.to_lowercase() == ":authority"))
            .count();
        
        if http2_count < total_requests / 2 {
            issues.push("Many requests not using HTTP/2".to_string());
        }

        issues
    }
}
