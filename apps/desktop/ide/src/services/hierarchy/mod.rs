//! # Hierarchy Service
//!
//! Service for managing code hierarchy.

mod client;
mod builder;
mod impl_;

pub use client::HierarchyClient;
pub use builder::{HierarchyBuilder, DefaultHierarchyBuilder};
pub use impl_::{create_hierarchy_client, HierarchyClientImpl};
