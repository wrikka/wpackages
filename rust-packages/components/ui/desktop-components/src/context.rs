use crate::types::theme::RsuiTheme;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct RsuiContext {
    pub theme: Arc<RsuiTheme>,
}

impl RsuiContext {
    pub fn new(theme: RsuiTheme) -> Self {
        Self {
            theme: Arc::new(theme),
        }
    }
}
