use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};
use tracing::{debug, info};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub event_type: String,
    pub payload: serde_json::Value,
    pub timestamp: i64,
    pub correlation_id: Option<String>,
}

pub type EventHandler = Box<dyn Fn(Event) + Send + Sync>;

pub struct EventBus {
    sender: broadcast::Sender<Event>,
    subscribers: Arc<Mutex<HashMap<String, Vec<EventHandler>>>>,
}

impl EventBus {
    pub fn new(capacity: usize) -> Self {
        let (sender, _) = broadcast::channel(capacity);

        Self {
            sender,
            subscribers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn publish(&self, event: Event) {
        debug!("Publishing event: {}", event.event_type);
        let _ = self.sender.send(event);
    }

    pub fn subscribe(&self, _event_type: String) -> broadcast::Receiver<Event> {
        self.sender.subscribe()
    }

    pub fn register_handler(&self, event_type: String, handler: EventHandler) {
        let mut subscribers = self.subscribers.lock().unwrap();
        subscribers.entry(event_type).or_insert_with(Vec::new).push(handler);
    }

    pub async fn handle_event(&self, event: Event) {
        let subscribers = self.subscribers.lock().unwrap();
        
        if let Some(handlers) = subscribers.get(&event.event_type) {
            for handler in handlers {
                handler(event.clone());
            }
        }
    }
}

pub struct EventSubscription {
    receiver: broadcast::Receiver<Event>,
    event_types: Vec<String>,
}

impl EventSubscription {
    pub fn new(receiver: broadcast::Receiver<Event>, event_types: Vec<String>) -> Self {
        Self {
            receiver,
            event_types,
        }
    }

    pub async fn recv(&mut self) -> Option<Event> {
        loop {
            match self.receiver.recv().await {
                Ok(event) => {
                    if self.event_types.is_empty() || self.event_types.contains(&event.event_type) {
                        return Some(event);
                    }
                }
                Err(_) => return None,
            }
        }
    }
}
