use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub navigation_start: f64,
    pub dom_content_loaded: f64,
    pub load_complete: f64,
    pub first_paint: Option<f64>,
    pub first_contentful_paint: Option<f64>,
    pub dom_interactive: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceTiming {
    pub name: String,
    pub resource_type: String,
    pub start_time: f64,
    pub duration: f64,
    pub transfer_size: u64,
    pub encoded_body_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceProfile {
    pub metrics: PerformanceMetrics,
    pub resources: Vec<ResourceTiming>,
    pub js_heap_size: Option<u64>,
    pub total_nodes: Option<u32>,
}

#[async_trait]
pub trait PerformanceProfilingService: Send + Sync {
    async fn get_metrics(&self, session_id: &str) -> Result<PerformanceMetrics>;
    async fn get_resource_timing(&self, session_id: &str) -> Result<Vec<ResourceTiming>>;
    async fn get_profile(&self, session_id: &str) -> Result<PerformanceProfile>;
    async fn start_profiling(&self, session_id: &str) -> Result<String>;
    async fn stop_profiling(
        &self,
        session_id: &str,
        profile_id: &str,
    ) -> Result<PerformanceProfile>;
}
