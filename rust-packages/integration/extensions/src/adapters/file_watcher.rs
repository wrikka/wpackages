//! An adapter for watching file system events.

//! An adapter for watching file system events.

use crate::error::Result;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;
use std::time::Duration;
use tracing::{error, info};

/// Watches a directory for file changes and triggers a callback.
pub struct FileWatcher {
    _watcher: RecommendedWatcher,
}

impl FileWatcher {
    /// Creates a new `FileWatcher` that calls the provided callback on any change.
    pub fn new<F>(mut callback: F) -> Result<Self>
    where
        F: FnMut() + Send + 'static,
    {
        let watcher = RecommendedWatcher::new(
            move |res: notify::Result<Event>| match res {
                Ok(event) => {
                    if event.kind.is_modify() || event.kind.is_create() || event.kind.is_remove() {
                        callback();
                    }
                }
                Err(e) => error!("File watch error: {:?}", e),
            },
            Config::default().with_poll_interval(Duration::from_secs(2)),
        )?;

        Ok(Self { _watcher: watcher })
    }

    /// Starts watching the specified directory recursively.
    pub fn watch(&mut self, path: &Path) -> Result<()> {
        info!("FileWatcher is now watching: {:?}", path);
        self._watcher.watch(path, RecursiveMode::Recursive)?;
        Ok(())
    }
}
