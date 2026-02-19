pub mod actions;
pub mod backends;
pub mod config;
pub mod error;
pub mod event;
pub mod event_handler;
pub mod filtering;
pub mod traits;

pub use config::Config;
pub use error::{Result, WatcherError};
pub use event::{Event, EventKind};
use crate::backends::AutoWatcher;
use crate::event_handler::EventHandler;
use std::path::Path;
use tokio::sync::mpsc;

pub use traits::Backend;

/// A high-level, asynchronous filesystem watcher.
///
/// The `Watcher` provides a unified interface to monitor files and directories for changes,
/// regardless of the underlying operating system. It automatically selects the best available
/// backend (native OS APIs or polling) and provides a flexible event handling pipeline.
///
/// # Examples
///
/// ```no_run
/// use watcher::{Watcher, Config};
/// use tokio::sync::mpsc;
/// 
/// #[tokio::main]
/// async fn main() -> anyhow::Result<()> {
///     let (tx, mut rx) = mpsc::channel(100);
///     let config = Config::default();
/// 
///     let mut watcher = Watcher::new(config, tx)?;
///     watcher.add_path("./src")?;
/// 
///     // Start the watcher in a separate task
///     tokio::spawn(async move {
///         if let Err(e) = watcher.watch().await {
///             eprintln!("Watcher error: {}", e);
///         }
///     });
/// 
///     // Receive events
///     while let Some(Ok(event)) = rx.recv().await {
///         println!("Event: {:?}", event);
///     }
/// 
///     Ok(())
/// }
/// ```
pub struct Watcher {
    /// The backend instance that performs the actual file system watching.
    backend: Box<dyn Backend>,
    /// The join handle of the event handling task.
    event_handler_jh: Option<tokio::task::JoinHandle<()>>,
}

impl Watcher {
    /// Creates a new `Watcher`.
    ///
    /// This initializes the appropriate backend and sets up the event handling pipeline.
    ///
    /// # Arguments
    ///
    /// * `config`: The `Config` struct that defines the watcher's behavior.
    /// * `tx`: A `tokio::sync::mpsc::Sender` to which `Result<Event>` messages will be sent.
    pub fn new(config: Config, tx: mpsc::Sender<Result<Event>>) -> Result<Self> {
        let (backend_tx, mut backend_rx) = mpsc::channel(100);

        let mut event_handler = EventHandler::new(
            config.debouncing.clone(),
            config.actions.clone(),
            tx,
        );

        let event_handler_jh = tokio::spawn(async move {
            while let Some(event_result) = backend_rx.recv().await {
                match event_result {
                    Ok(event) => event_handler.process_event(event).await,
                    Err(e) => error!("Backend error: {}", e),
                }
            }
        });

        let backend = Box::new(AutoWatcher::new(config, backend_tx)?);

        Ok(Self {
            backend,
            event_handler_jh: Some(event_handler_jh),
        })
    }

    /// Adds a path to be watched recursively.
    ///
    /// The watcher will monitor the given path and all its subdirectories for changes.
    /// The filtering rules defined in the `Config` will be applied.
    ///
    /// # Arguments
    ///
    /// * `path`: The path to be watched.
    pub fn add_path(&mut self, path: &Path) -> Result<()> {
        self.backend.add_path(path)
    }

    /// Removes a path from the watch list.
    ///
    /// The watcher will stop monitoring the given path and its subdirectories.
    ///
    /// # Arguments
    ///
    /// * `path`: The path to be removed from the watch list.
    pub fn remove_path(&mut self, path: &Path) -> Result<()> {
        self.backend.remove_path(path)
    }

    /// Starts the watching process.
    ///
    /// This method consumes the watcher and runs the backend in a blocking fashion
    /// within the current asynchronous task. It should typically be spawned onto the
    /// `tokio` runtime.
    pub async fn watch(&mut self) -> Result<()> {
        self.backend.watch().await
    }

    /// Stops the watching process and cleans up resources.
    ///
    /// This method will abort the event handling task and unwatch the backend.
    pub fn unwatch(&mut self) -> Result<()> {
        if let Some(jh) = self.event_handler_jh.take() {
            jh.abort();
        }
        self.backend.unwatch()
    }
}
