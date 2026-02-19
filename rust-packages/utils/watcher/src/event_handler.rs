use crate::actions::{CommandProcessor, EventProcessor, HttpProcessor};
use crate::config::{Action, Debouncing};
use crate::error::Result;
use crate::event::Event;
use log::{debug, error, trace};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::mpsc::Sender;
use tokio::time::{Instant, Duration};

/// Handles debouncing, aggregation, and action execution for raw filesystem events.
pub struct EventHandler {
    debounce_config: Debouncing,
    tx: Sender<Result<Event>>,
    processors: Vec<Arc<dyn EventProcessor>>,
    last_event_map: HashMap<PathBuf, (Event, Instant)>,
}

impl EventHandler {
    pub fn new(debounce_config: Debouncing, actions: Vec<Action>, tx: Sender<Result<Event>>) -> Self {
        let processors: Vec<Arc<dyn EventProcessor>> = actions
            .into_iter()
            .map(|action| -> Arc<dyn EventProcessor> {
                match action {
                    Action::Command(cmd) => Arc::new(CommandProcessor::new(cmd)),
                    Action::Http(http) => Arc::new(HttpProcessor::new(http)),
                }
            })
            .collect();

        Self {
            debounce_config,
            tx,
            processors,
            last_event_map: HashMap::new(),
        }
    }

    /// Processes a raw event from a backend.
        pub async fn process_event(&mut self, event: Event) {
        if self.debounce_config.timeout.is_zero() {
            trace!("Event received, processing immediately (debouncing disabled): {:?}", event);
            self.handle_final_event(event).await;
            return;
        }

        let path = event.paths.get(0).cloned().unwrap_or_default();
        trace!("Debouncing event for path: {:?}", path);

        if let Some((existing_event, instant)) = self.last_event_map.get_mut(&path) {
            // An event for this path is already debouncing. Aggregate them.
            if self.debounce_config.aggregate {
                // If a file is created then removed, cancel them out.
                if matches!(existing_event.kind, EventKind::Create) && matches!(event.kind, EventKind::Remove) {
                    self.last_event_map.remove(&path);
                    return;
                }
                Self::aggregate_events(existing_event, event);
            } else {
                // If not aggregating, the latest event wins.
                *existing_event = event;
            }
            *instant = Instant::now();
        } else {
            self.last_event_map.insert(path, (event, Instant::now()));
        }
    }

    /// Merges a new event into an existing one.
    fn aggregate_events(old: &mut Event, new: Event) {
        // The new event's time is always more recent.
        old.time = new.time;

        match (&old.kind, new.kind) {
            // If a file is created then modified, it's still just a create event.
            (EventKind::Create, EventKind::Modify(_)) => { /* Do nothing, keep Create */ }

            // If a file is modified multiple times, update to the latest modify kind.
            (EventKind::Modify(_), EventKind::Modify(new_kind)) => {
                old.kind = EventKind::Modify(new_kind);
            }

            // Any event followed by a remove becomes a remove.
            (_, EventKind::Remove) => {
                old.kind = EventKind::Remove;
            }

            // A rename 'from' followed by a 'to' can be merged into a single rename event.
            // This is a simplification; robust rename handling is complex.
            (EventKind::Rename(RenameKind::From(from)), EventKind::Rename(RenameKind::To(to))) => {
                old.kind = EventKind::Rename(crate::event::RenameKind::Both { from: from.clone(), to: to });
            }

            // For all other combinations, the newest event takes precedence.
            _ => {
                old.kind = new.kind;
            }
        }
        // Update paths to the latest event's paths
        old.paths = new.paths;
    }

    /// Flushes any pending events that have timed out.
    pub async fn flush_events(&mut self) {
        if self.debounce_config.timeout.is_zero() { return; }

        let now = Instant::now();
        let timeout = self.debounce_config.timeout;
        let mut events_to_send = Vec::new();

        self.last_event_map.retain(|_path, (event, instant)| {
            if now.duration_since(*instant) > timeout {
                events_to_send.push(event.clone());
                false
            } else {
                true
            }
        });

        if !events_to_send.is_empty() {
            debug!("Flushing {} debounced events.", events_to_send.len());
        }
        
        for event in events_to_send {
            self.handle_final_event(event).await;
        }
    }

    /// Processes a final, debounced event, sending it to the user and triggering actions.
    async fn handle_final_event(&self, event: Event) {
        // Send the event to the user's channel first.
        if self.tx.send(Ok(event.clone())).await.is_err() {
            error!("Event channel closed by receiver. Cannot process actions.");
            return;
        }

        // Trigger all configured actions for this event.
        for processor in &self.processors {
            let processor = processor.clone();
            let event_clone = event.clone();
            tokio::spawn(async move {
                if let Err(e) = processor.process(&event_clone).await {
                    error!("Action processor failed: {}", e);
                }
            });
        }
    }
}
