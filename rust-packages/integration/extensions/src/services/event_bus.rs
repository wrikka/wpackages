//! Event bus service for inter-extension communication

use crate::error::{AppError, Result};
use crate::types::event::{EventFilter, EventListener, ExtensionEvent};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info, warn};

/// Event bus for dispatching events to listeners
#[derive(Clone)]
pub struct EventBus {
    inner: Arc<RwLock<EventBusInner>>,
}

struct EventBusInner {
    listeners: Vec<RegisteredListener>,
    event_history: Vec<ExtensionEvent>,
    max_history_size: usize,
}

struct RegisteredListener {
    id: String,
    listener: Box<dyn EventListener>,
    filter: EventFilter,
}

impl EventBus {
    /// Creates a new EventBus
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(EventBusInner {
                listeners: Vec::new(),
                event_history: Vec::new(),
                max_history_size: 1000,
            })),
        }
    }

    /// Dispatches an event to all matching listeners
    pub async fn dispatch(&self, event: ExtensionEvent) {
        debug!("Dispatching event: {}", event.event_type());

        let inner = self.inner.read().await;

        // Notify matching listeners
        for registered in &inner.listeners {
            if registered.filter.matches(&event) {
                debug!(
                    "Notifying listener {} for event {}",
                    registered.id,
                    event.event_type()
                );
                registered.listener.on_event(event.clone());
            }
        }

        // Add to history
        drop(inner);
        let mut inner = self.inner.write().await;
        inner.event_history.push(event);

        // Trim history if needed
        let history_len = inner.event_history.len();
        let max_size = inner.max_history_size;
        if history_len > max_size {
            inner.event_history.drain(0..history_len - max_size);
        }
    }

    /// Registers a new event listener
    pub async fn register_listener(
        &self,
        id: impl Into<String>,
        listener: Box<dyn EventListener>,
        filter: EventFilter,
    ) {
        let listener_id = id.into();
        debug!("Registering listener: {}", listener_id);

        let mut inner = self.inner.write().await;
        inner.listeners.push(RegisteredListener {
            id: listener_id.clone(),
            listener,
            filter,
        });

        info!("Listener {} registered", listener_id);
    }

    /// Unregisters an event listener
    pub async fn unregister_listener(&self, id: impl AsRef<str>) -> Result<()> {
        let listener_id = id.as_ref();
        debug!("Unregistering listener: {}", listener_id);

        let mut inner = self.inner.write().await;
        let original_len = inner.listeners.len();
        inner.listeners.retain(|l| l.id != listener_id);

        if inner.listeners.len() < original_len {
            info!("Listener {} unregistered", listener_id);
            Ok(())
        } else {
            warn!("Listener {} not found", listener_id);
            Err(AppError::ListenerNotFound(listener_id.to_string()))
        }
    }

    /// Gets the event history
    pub async fn get_history(&self) -> Vec<ExtensionEvent> {
        let inner = self.inner.read().await;
        inner.event_history.clone()
    }

    /// Gets filtered event history
    pub async fn get_filtered_history(&self, filter: &EventFilter) -> Vec<ExtensionEvent> {
        let inner = self.inner.read().await;
        inner
            .event_history
            .iter()
            .filter(|e| filter.matches(e))
            .cloned()
            .collect()
    }

    /// Clears the event history
    pub async fn clear_history(&self) {
        let mut inner = self.inner.write().await;
        inner.event_history.clear();
        info!("Event history cleared");
    }

    /// Gets the number of registered listeners
    pub async fn listener_count(&self) -> usize {
        let inner = self.inner.read().await;
        inner.listeners.len()
    }

    /// Sets the maximum history size
    pub async fn set_max_history_size(&self, size: usize) {
        let mut inner = self.inner.write().await;
        inner.max_history_size = size;

        // Trim if necessary
        let history_len = inner.event_history.len();
        if history_len > size {
            inner.event_history.drain(0..history_len - size);
        }
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new()
    }
}

/// Simple event listener implementation for testing
#[derive(Clone)]
pub struct SimpleEventListener {
    callback: Arc<dyn Fn(ExtensionEvent) + Send + Sync>,
}

impl SimpleEventListener {
    /// Creates a new simple event listener
    pub fn new<F>(callback: F) -> Self
    where
        F: Fn(ExtensionEvent) + Send + Sync + 'static,
    {
        Self {
            callback: Arc::new(callback),
        }
    }
}

impl EventListener for SimpleEventListener {
    fn on_event(&self, event: ExtensionEvent) {
        (self.callback)(event);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc, Mutex};

    #[tokio::test]
    async fn test_event_dispatch() {
        let bus = EventBus::new();
        let events = Arc::new(Mutex::new(Vec::new()));

        let listener = SimpleEventListener::new({
            let events = events.clone();
            move |event| {
                events.lock().unwrap().push(event);
            }
        });

        bus.register_listener("test", Box::new(listener), EventFilter::new())
            .await;

        let event = ExtensionEvent::FileChanged {
            path: "/test/path".to_string(),
        };
        bus.dispatch(event.clone()).await;

        let received = events.lock().unwrap();
        assert_eq!(received.len(), 1);
        assert_eq!(received[0], event);
    }

    #[tokio::test]
    async fn test_event_filter() {
        let bus = EventBus::new();
        let file_events = Arc::new(Mutex::new(Vec::new()));

        let listener = SimpleEventListener::new({
            let file_events = file_events.clone();
            move |event| {
                file_events.lock().unwrap().push(event);
            }
        });

        let filter = EventFilter::new().with_event_type("file_changed");
        bus.register_listener("test", Box::new(listener), filter)
            .await;

        bus.dispatch(ExtensionEvent::FileChanged {
            path: "/test/path".to_string(),
        })
        .await;
        bus.dispatch(ExtensionEvent::CommandExecuted {
            command_id: CommandId::new("test"),
        })
        .await;

        let received = file_events.lock().unwrap();
        assert_eq!(received.len(), 1);
    }

    #[tokio::test]
    async fn test_event_history() {
        let bus = EventBus::new();

        bus.dispatch(ExtensionEvent::FileChanged {
            path: "/test/path".to_string(),
        })
        .await;
        bus.dispatch(ExtensionEvent::CommandExecuted {
            command_id: CommandId::new("test"),
        })
        .await;

        let history = bus.get_history().await;
        assert_eq!(history.len(), 2);
    }
}
