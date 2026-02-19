use crate::error::{Error, Result};
use camino::Utf8Path;
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher as NotifyWatcher};
use std::sync::mpsc::{channel, Receiver};

/// Creates a new file system watcher for a given path.
///
/// Returns a tuple containing the watcher and a receiver for events. The
/// watcher will stop sending events when it is dropped.
pub fn watch(path: &Utf8Path) -> Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (tx, rx) = channel();

    let mut watcher = notify::recommended_watcher(move |res| {
        if tx.send(res).is_err() {
            // The receiver has been dropped, so we can't send any more events.
            // This is a normal part of shutdown.
        }
    })?;

    watcher.watch(path.as_std_path(), RecursiveMode::Recursive)?;

    Ok((watcher, rx))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    use tempfile::tempdir;

    #[test]
    fn test_watch_file_creation() {
        let dir = tempdir().unwrap();
        let dir_path = Utf8Path::from_path(dir.path()).unwrap();
        let file_path = dir_path.join("test.txt");

        // Create the watcher. The `_watcher` variable must be kept alive.
        let (_watcher, rx) = watch(dir_path).unwrap();

        // Perform an action that should trigger an event.
        std::fs::write(&file_path, "hello").unwrap();

        // Wait for the event.
        let event = rx.recv_timeout(Duration::from_secs(2)).unwrap().unwrap();

        assert!(event.kind.is_create());
        assert!(event.paths.iter().any(|p| p == file_path.as_std_path()));
    }
}
