use crate::config::Config;
use crate::error::Result;
use crate::event::Event;
use std::path::Path;
use tokio::sync::mpsc::Sender;

use crate::{config::Config, error::Result, event::Event};
use std::path::Path;
use tokio::sync::mpsc::Sender;

/// A trait for a watcher backend that produces raw filesystem events.
#[doc = "This trait is implemented by the different watching strategies (e.g., polling, native OS APIs).
It is an internal abstraction and not typically used directly by library consumers."]
#[async_trait::async_trait]
pub trait Backend: Send + Sync {
    /// Create a new backend with a given configuration and an async sender for raw events.
    fn new(config: Config, tx: Sender<Result<Event>>) -> Result<Self>
    where
        Self: Sized;

    /// Start watching for filesystem events.
    async fn watch(&mut self) -> Result<()>;

    /// Stop watching for filesystem events.
    fn unwatch(&mut self) -> Result<()>;

    /// Add a path to be watched.
    fn add_path(&mut self, path: &Path) -> Result<()>;

    /// Remove a path from being watched.
    fn remove_path(&mut self, path: &Path) -> Result<()>;
}
