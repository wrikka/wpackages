//! Performance optimization types

use serde::{Deserialize, Serialize};

/// Performance optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceOptimization {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: OptimizationCategory,
    pub impact: OptimizationImpact,
    pub effort: OptimizationEffort,
    pub applied: bool,
}

impl PerformanceOptimization {
    pub fn new(id: impl Into<String>, name: impl Into<String>, description: impl Into<String>, category: OptimizationCategory) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: description.into(),
            category,
            impact: OptimizationImpact::Medium,
            effort: OptimizationEffort::Medium,
            applied: false,
        }
    }

    pub fn with_impact(mut self, impact: OptimizationImpact) -> Self {
        self.impact = impact;
        self
    }

    pub fn with_effort(mut self, effort: OptimizationEffort) -> Self {
        self.effort = effort;
        self
    }

    pub fn with_applied(mut self, applied: bool) -> Self {
        self.applied = applied;
        self
    }
}

/// Optimization category
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OptimizationCategory {
    Memory,
    Cpu,
    Rendering,
    Editor,
    Lsp,
    Plugin,
    Network,
    Caching,
}

/// Optimization impact
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OptimizationImpact {
    Low,
    Medium,
    High,
    Critical,
}

/// Optimization effort
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OptimizationEffort {
    Trivial,
    Low,
    Medium,
    High,
    Significant,
}

/// Common optimizations
pub struct CommonOptimizations;

impl CommonOptimizations {
    pub fn memory() -> Vec<PerformanceOptimization> {
        vec![
            PerformanceOptimization::new(
                "opt1",
                "Lazy Loading",
                "Load resources on demand instead of all at once",
                OptimizationCategory::Memory,
            )
            .with_impact(OptimizationImpact::High)
            .with_effort(OptimizationEffort::Medium),
            PerformanceOptimization::new(
                "opt2",
                "Object Pooling",
                "Reuse expensive objects instead of creating new ones",
                OptimizationCategory::Memory,
            )
            .with_impact(OptimizationImpact::Medium)
            .with_effort(OptimizationEffort::Medium),
            PerformanceOptimization::new(
                "opt3",
                "Memory Caching",
                "Cache frequently used data in memory",
                OptimizationCategory::Caching,
            )
            .with_impact(OptimizationImpact::High)
            .with_effort(OptimizationEffort::Low),
        ]
    }

    pub fn cpu() -> Vec<PerformanceOptimization> {
        vec![
            PerformanceOptimization::new(
                "opt4",
                "Debouncing",
                "Debounce expensive operations",
                OptimizationCategory::Cpu,
            )
            .with_impact(OptimizationImpact::Medium)
            .with_effort(OptimizationEffort::Low),
            PerformanceOptimization::new(
                "opt5",
                "Throttling",
                "Limit the rate of expensive operations",
                OptimizationCategory::Cpu,
            )
            .with_impact(OptimizationImpact::Medium)
            .with_effort(OptimizationEffort::Low),
            PerformanceOptimization::new(
                "opt6",
                "Web Workers",
                "Offload CPU-intensive tasks to workers",
                OptimizationCategory::Cpu,
            )
            .with_impact(OptimizationImpact::High)
            .with_effort(OptimizationEffort::High),
        ]
    }

    pub fn rendering() -> Vec<PerformanceOptimization> {
        vec![
            PerformanceOptimization::new(
                "opt7",
                "Virtual Scrolling",
                "Only render visible items in lists",
                OptimizationCategory::Rendering,
            )
            .with_impact(OptimizationImpact::High)
            .with_effort(OptimizationEffort::High),
            PerformanceOptimization::new(
                "opt8",
                "Code Splitting",
                "Split code into smaller chunks",
                OptimizationCategory::Rendering,
            )
            .with_impact(OptimizationImpact::High)
            .with_effort(OptimizationEffort::Medium),
            PerformanceOptimization::new(
                "opt9",
                "Request Animation Frame",
                "Batch DOM updates",
                OptimizationCategory::Rendering,
            )
            .with_impact(OptimizationImpact::Medium)
            .with_effort(OptimizationEffort::Low),
        ]
    }

    pub fn lsp() -> Vec<PerformanceOptimization> {
        vec![
            PerformanceOptimization::new(
                "opt10",
                "Incremental Sync",
                "Sync only changed parts of documents",
                OptimizationCategory::Lsp,
            )
            .with_impact(OptimizationImpact::High)
            .with_effort(OptimizationEffort::High),
            PerformanceOptimization::new(
                "opt11",
                "Request Batching",
                "Batch multiple LSP requests",
                OptimizationCategory::Lsp,
            )
            .with_impact(OptimizationImpact::Medium)
            .with_effort(OptimizationEffort::Medium),
            PerformanceOptimization::new(
                "opt12",
                "Response Caching",
                "Cache LSP responses",
                OptimizationCategory::Caching,
            )
            .with_impact(OptimizationImpact::Medium)
            .with_effort(OptimizationEffort::Low),
        ]
    }

    pub fn all() -> Vec<PerformanceOptimization> {
        let mut all = Vec::new();
        all.extend(Self::memory());
        all.extend(Self::cpu());
        all.extend(Self::rendering());
        all.extend(Self::lsp());
        all
    }
}
