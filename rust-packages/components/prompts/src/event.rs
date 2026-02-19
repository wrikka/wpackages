use crate::error::Result;
use crossterm::event::{self, Event as CrosstermEvent, KeyCode, KeyEvent, KeyModifiers};
use std::time::Duration;
use tokio::sync::mpsc;

/// Event types for prompt handling
#[derive(Debug, Clone)]
pub enum Event {
    /// Key press
    Key(KeyEvent),
    /// Mouse event
    Mouse(crossterm::event::MouseEvent),
    /// Resize event
    Resize(u16, u16),
    /// Tick event for animations
    Tick,
    /// Interrupt (Ctrl+C)
    Interrupt,
}

/// Event reader for handling terminal events
pub struct EventReader {
    rx: mpsc::UnboundedReceiver<Event>,
    _handle: tokio::task::JoinHandle<()>,
}

impl EventReader {
    /// Create new event reader
    pub fn new(tick_rate: Duration) -> Self {
        let (tx, rx) = mpsc::unbounded_channel();

        let _handle = tokio::spawn(async move {
            let mut interval = tokio::time::interval(tick_rate);
            
            loop {
                interval.tick().await;
                
                // Try to read event with timeout
                if event::poll(Duration::from_millis(0)).unwrap_or(false) {
                    if let Ok(event) = event::read() {
                        let event = match event {
                            CrosstermEvent::Key(key) => {
                                // Check for interrupt
                                if key.code == KeyCode::Char('c') 
                                    && key.modifiers == KeyModifiers::CONTROL {
                                    Event::Interrupt
                                } else {
                                    Event::Key(key)
                                }
                            }
                            CrosstermEvent::Mouse(mouse) => Event::Mouse(mouse),
                            CrosstermEvent::Resize(w, h) => Event::Resize(w, h),
                            _ => continue,
                        };
                        
                        if tx.send(event).is_err() {
                            break;
                        }
                    }
                } else {
                    // Send tick event
                    if tx.send(Event::Tick).is_err() {
                        break;
                    }
                }
            }
        });

        Self { rx, _handle }
    }

    /// Get next event
    pub async fn next(&mut self) -> Result<Event> {
        self.rx.recv().await.ok_or(crate::error::Error::Cancelled)
    }

    /// Try to get next event without waiting
    pub fn try_next(&mut self) -> Option<Event> {
        self.rx.try_recv().ok()
    }
}

impl Default for EventReader {
    fn default() -> Self {
        Self::new(Duration::from_millis(100))
    }
}

/// Event handler trait
pub trait EventHandler {
    fn handle(&mut self, event: Event) -> Result<()>;
}

/// Simple event handler closure wrapper
pub struct EventHandlerFn<F> {
    handler: F,
}

impl<F> EventHandlerFn<F>
where
    F: FnMut(Event) -> Result<()>,
{
    pub fn new(handler: F) -> Self {
        Self { handler }
    }
}

impl<F> EventHandler for EventHandlerFn<F>
where
    F: FnMut(Event) -> Result<()>,
{
    fn handle(&mut self, event: Event) -> Result<()> {
        (self.handler)(event)
    }
}

/// Event buffer for debouncing
pub struct EventBuffer {
    events: Vec<Event>,
    last_event: Option<Event>,
    debounce_ms: u64,
}

impl EventBuffer {
    pub fn new(debounce_ms: u64) -> Self {
        Self {
            events: Vec::new(),
            last_event: None,
            debounce_ms,
        }
    }

    pub fn push(&mut self, event: Event) {
        self.events.push(event);
    }

    pub fn drain(&mut self) -> Vec<Event> {
        std::mem::take(&mut self.events)
    }

    pub fn should_debounce(&self, event: &Event) -> bool {
        if let Some(ref last) = self.last_event {
            // Debounce repeated events of same type
            std::mem::discriminant(last) == std::mem::discriminant(event)
        } else {
            false
        }
    }
}

/// Utility functions for events
pub mod utils {
    use super::*;

    /// Check if key is a navigation key
    pub fn is_navigation(key: KeyCode) -> bool {
        matches!(key, 
            KeyCode::Up | KeyCode::Down | 
            KeyCode::Left | KeyCode::Right |
            KeyCode::Home | KeyCode::End |
            KeyCode::PageUp | KeyCode::PageDown
        )
    }

    /// Check if key is an action key
    pub fn is_action(key: KeyCode) -> bool {
        matches!(key,
            KeyCode::Enter | KeyCode::Esc | KeyCode::Tab |
            KeyCode::Backspace | KeyCode::Delete
        )
    }

    /// Get character from key event
    pub fn get_char(key: KeyEvent) -> Option<char> {
        match key.code {
            KeyCode::Char(c) => Some(c),
            _ => None,
        }
    }
}
