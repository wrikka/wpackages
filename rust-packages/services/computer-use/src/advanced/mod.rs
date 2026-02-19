//! Advanced Features (Features 11-20 + New Features)
//!
//! This module implements advanced features for AI Computer Use:
//! 11. Template Marketplace
//! 12. Performance Analytics
//! 13. Multi-Agent Collaboration
//! 14. Self-Improvement & Learning
//! 15. World Model Integration
//! 16. Knowledge Graph Construction
//! 17. Dynamic Strategy Selection
//! 18. Parallel Task Execution
//! 19. Incremental Progress Tracking
//! 20. Adaptive Timeout Management
//!
//! New Features:
//! - Self-Healing Automation
//! - Error Prediction
//! - Batch Execution
//! - Marketplace

pub mod memory;
pub mod multi_agent;
pub mod learning;
pub mod world_model;
pub mod knowledge_graph;
pub mod strategy_selection;
pub mod parallel_execution;
pub mod progress_tracking;
pub mod timeout_management;
pub mod self_healing;
pub mod error_prediction;
pub mod batch_execution;
pub mod marketplace;

pub use memory::*;
pub use multi_agent::*;
pub use learning::*;
pub use world_model::*;
pub use knowledge_graph::*;
pub use strategy_selection::*;
pub use parallel_execution::*;
pub use progress_tracking::*;
pub use timeout_management::*;
pub use self_healing::*;
pub use error_prediction::*;
pub use batch_execution::*;
pub use marketplace::*;
