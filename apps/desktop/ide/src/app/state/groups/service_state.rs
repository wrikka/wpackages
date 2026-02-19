//! Service state for service instances

use super::*;

/// Service state containing service instances
#[derive(Debug)]
pub struct ServiceState {
    pub review_service: Option<std::sync::Arc<dyn crate::services::review_service::ReviewService>>,
    pub graph_service: Option<std::sync::Arc<dyn crate::services::git_graph_service::GraphService>>,
    pub search_service: Option<std::sync::Arc<dyn crate::services::git_search_service::GitSearchService>>,
    pub ci_service: Option<std::sync::Arc<dyn crate::services::ci_service::CiService>>,
}

impl Default for ServiceState {
    fn default() -> Self {
        Self {
            review_service: None,
            graph_service: None,
            search_service: None,
            ci_service: None,
        }
    }
}
