//! Performance metrics and related types

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Performance metric
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetric {
    pub id: String,
    pub name: String,
    pub category: MetricCategory,
    pub value: f64,
    pub unit: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, String>,
}

impl PerformanceMetric {
    pub fn new(id: impl Into<String>, name: impl Into<String>, category: MetricCategory, value: f64, unit: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            category,
            value,
            unit: unit.into(),
            timestamp: chrono::Utc::now(),
            metadata: HashMap::new(),
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn add_metadata(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.metadata.insert(key.into(), value.into());
        self
    }
}

/// Metric category
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MetricCategory {
    Memory,
    Cpu,
    Disk,
    Network,
    Rendering,
    Editor,
    Lsp,
    Plugin,
    System,
}

/// Performance snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSnapshot {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metrics: Vec<PerformanceMetric>,
    pub memory_usage: super::resource::MemoryUsage,
    pub cpu_usage: super::resource::CpuUsage,
}

impl PerformanceSnapshot {
    pub fn new() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now(),
            metrics: Vec::new(),
            memory_usage: super::resource::MemoryUsage::new(),
            cpu_usage: super::resource::CpuUsage::new(),
        }
    }

    pub fn with_metrics(mut self, metrics: Vec<PerformanceMetric>) -> Self {
        self.metrics = metrics;
        self
    }

    pub fn with_memory_usage(mut self, memory: super::resource::MemoryUsage) -> Self {
        self.memory_usage = memory;
        self
    }

    pub fn with_cpu_usage(mut self, cpu: super::resource::CpuUsage) -> Self {
        self.cpu_usage = cpu;
        self
    }

    pub fn metric_count(&self) -> usize {
        self.metrics.len()
    }

    pub fn get_metric(&self, id: &str) -> Option<&PerformanceMetric> {
        self.metrics.iter().find(|m| m.id == id)
    }

    pub fn get_metric_by_name(&self, name: &str) -> Option<&PerformanceMetric> {
        self.metrics.iter().find(|m| m.name == name)
    }

    pub fn get_metrics_by_category(&self, category: MetricCategory) -> Vec<&PerformanceMetric> {
        self.metrics.iter().filter(|m| m.category == category).collect()
    }
}

impl Default for PerformanceSnapshot {
    fn default() -> Self {
        Self::new()
    }
}
