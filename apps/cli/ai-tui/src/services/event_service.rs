//! Event handling service for TUI application
//!
//! This service handles terminal events and dispatches actions.
//! It isolates terminal I/O operations in the services layer.

use crate::error::Result;
use crate::services::traits::EventService;
use crate::types::TerminalEvent;
use std::sync::Arc;

/// Event handler for the TUI application
pub struct EventHandler {
    event_service: Arc<dyn EventService>,
}

impl EventHandler {
    /// Create a new event handler with the given event service
    pub fn new(event_service: Arc<dyn EventService>) -> Self {
        Self { event_service }
    }

    /// Read the next terminal event
    pub async fn read_event(&self) -> Result<TerminalEvent> {
        self.event_service.read_event().await
    }

    /// Poll for events with timeout
    pub async fn poll_event(&self, timeout: std::time::Duration) -> Result<bool> {
        self.event_service.poll_event(timeout).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{KeyEvent, KeyModifiers};

    struct MockEventService;

    #[async_trait::async_trait]
    impl EventService for MockEventService {
        async fn read_event(&self) -> Result<TerminalEvent> {
            Ok(TerminalEvent::Key(KeyEvent {
                code: KeyCode::Char('q'),
                modifiers: KeyModifiers::default(),
            }))
        }

        async fn poll_event(&self, _timeout: std::time::Duration) -> Result<bool> {
            Ok(true)
        }
    }

    #[tokio::test]
    async fn test_event_handler_poll() {
        let mock = std::sync::Arc::new(MockEventService);
        let handler = EventHandler::new(mock);
        let result = handler
            .poll_event(std::time::Duration::from_millis(10))
            .await;
        assert!(result.is_ok());
    }
}
