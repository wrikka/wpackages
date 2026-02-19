//! File watching service
//!
//! Service for watching file system changes in projects.

use notify::{
    Event, EventKind, RecommendedWatcher, RecursiveMode, Result as NotifyResult, Watcher,
};
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use tokio::sync::mpsc as tokio_mpsc;

use super::super::error::ContextResult;

/// File watcher service for monitoring project changes.
///
/// This service uses the `notify` crate to watch for file system events
/// and forward them through a channel.
pub struct FileWatcher {
    watcher: RecommendedWatcher,
    _tx: mpsc::Sender<Event>,
}

impl FileWatcher {
    /// Creates a new file watcher for the specified path.
    ///
    /// # Arguments
    ///
    /// * `path` - The directory path to watch
    ///
    /// # Returns
    ///
    /// Returns a `FileWatcher` instance and a receiver for file events.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::services::file_watcher::FileWatcher;
    /// use std::path::Path;
    ///
    /// let (watcher, rx) = FileWatcher::new(Path::new("/path/to/project")).unwrap();
    /// ```
    pub fn new(path: &Path) -> ContextResult<(Self, tokio_mpsc::Receiver<PathBuf>)> {
        let (tx, _rx) = mpsc::channel();
        let (tokio_tx, tokio_rx) = tokio_mpsc::channel(100);
        let tx_clone = tx.clone();

        let mut watcher: RecommendedWatcher = Watcher::new(
            move |res: NotifyResult<Event>| {
                if let Ok(event) = res {
                    if let EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_) =
                        event.kind
                    {
                        for path in &event.paths {
                            let _ = tx_clone.send(event.clone());
                            let _ = tokio_tx.blocking_send(path.clone());
                        }
                    }
                }
            },
            notify::Config::default(),
        )?;

        watcher.watch(path, RecursiveMode::Recursive)?;

        Ok((Self { watcher, _tx: tx }, tokio_rx))
    }
}
