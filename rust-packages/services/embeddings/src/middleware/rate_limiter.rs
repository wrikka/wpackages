use std::sync::Arc;
use tower_governor::{
    governor::GovernorConfigBuilder,
    GovernorLayer,
};

/// Creates a rate limiting middleware layer.
pub fn get_rate_limiter(limit: usize) -> Arc<GovernorLayer> {
    let config = Arc::new(
        GovernorConfigBuilder::default()
            .per_second(limit as u64)
            .burst_size(limit as u32)
            .finish()
            .unwrap(),
    );
    Arc::new(GovernorLayer { config })
}
