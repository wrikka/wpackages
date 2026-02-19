//! Effect layer services for context analysis
//!
//! This module contains services that handle I/O operations and external interactions.

pub mod file_watcher;
pub mod git_service;
pub mod project_info_service;

pub use file_watcher::*;
pub use git_service::*;
pub use project_info_service::*;
