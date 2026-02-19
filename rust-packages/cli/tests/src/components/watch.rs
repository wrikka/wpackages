use crate::error::{TestingError, TestingResult};
use crate::types::TestConfig;
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::mpsc::{channel, Receiver};
use std::time::Duration;
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct FileChangeEvent {
    pub paths: Vec<PathBuf>,
    pub event_type: FileChangeEventType,
    pub timestamp: std::time::Instant,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FileChangeEventType {
    Created,
    Modified,
    Deleted,
    Any,
}

impl FileChangeEvent {
    pub fn is_test_file(&self) -> bool {
        self.paths.iter().any(|p| {
            let ext = p.extension().and_then(|e| e.to_str()).unwrap_or("");
            ext == "rs" && (p.file_name().map(|f| f.to_string_lossy().contains("test")).unwrap_or(false)
                || p.to_string_lossy().contains("/tests/"))
        })
    }

    pub fn is_source_file(&self) -> bool {
        self.paths.iter().any(|p| {
            let ext = p.extension().and_then(|e| e.to_str()).unwrap_or("");
            ext == "rs" && !self.is_test_file()
        })
    }
}

pub struct TestWatcher {
    watcher: Option<RecommendedWatcher>,
    receiver: Option<Receiver<Result<Event, notify::Error>>>,
    watched_paths: HashSet<PathBuf>,
    debounce: Duration,
    running: bool,
}

impl TestWatcher {
    pub fn new(debounce: Duration) -> Self {
        Self {
            watcher: None,
            receiver: None,
            watched_paths: HashSet::new(),
            debounce,
            running: false,
        }
    }

    pub fn from_config(config: &TestConfig) -> Self {
        Self::new(config.watch_debounce)
    }

    pub fn watch(&mut self, path: &PathBuf) -> TestingResult<()> {
        if self.watcher.is_none() {
            let (tx, rx) = channel();
            self.receiver = Some(rx);

            let tx_clone = tx.clone();
            let watcher = RecommendedWatcher::new(
                move |res: Result<Event, notify::Error>| {
                    let _ = tx_clone.send(res);
                },
                notify::Config::default(),
            )
            .map_err(|e| TestingError::Other(e.into()))?;

            self.watcher = Some(watcher);
        }

        if let Some(ref mut watcher) = self.watcher {
            watcher
                .watch(path, RecursiveMode::Recursive)
                .map_err(|e| TestingError::Other(e.into()))?;

            self.watched_paths.insert(path.clone());
            info!("Watching path: {:?}", path);
        }

        Ok(())
    }

    pub fn unwatch(&mut self, path: &PathBuf) -> TestingResult<()> {
        if let Some(ref mut watcher) = self.watcher {
            watcher
                .unwatch(path)
                .map_err(|e| TestingError::Other(e.into()))?;

            self.watched_paths.remove(path);
            info!("Stopped watching path: {:?}", path);
        }

        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(mut watcher) = self.watcher.take() {
            for path in &self.watched_paths {
                let _ = watcher.unwatch(path);
            }
        }
        self.watched_paths.clear();
        self.receiver = None;
        self.running = false;
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn watched_paths(&self) -> &HashSet<PathBuf> {
        &self.watched_paths
    }

    pub fn poll_events(&mut self) -> Vec<FileChangeEvent> {
        let mut events = Vec::new();
        let mut seen_paths: HashSet<PathBuf> = HashSet::new();

        if let Some(ref receiver) = self.receiver {
            while let Ok(Ok(event)) = receiver.try_recv() {
                let event_type = if event.kind.is_create() {
                    FileChangeEventType::Created
                } else if event.kind.is_modify() {
                    FileChangeEventType::Modified
                } else if event.kind.is_remove() {
                    FileChangeEventType::Deleted
                } else {
                    FileChangeEventType::Any
                };

                let relevant_paths: Vec<PathBuf> = event
                    .paths
                    .into_iter()
                    .filter(|p| !seen_paths.contains(p))
                    .collect();

                for p in &relevant_paths {
                    seen_paths.insert(p.clone());
                }

                if !relevant_paths.is_empty() {
                    events.push(FileChangeEvent {
                        paths: relevant_paths,
                        event_type,
                        timestamp: std::time::Instant::now(),
                    });
                }
            }
        }

        events
    }

    pub async fn wait_for_change(&mut self) -> TestingResult<Option<FileChangeEvent>> {
        let receiver = self
            .receiver
            .as_ref()
            .ok_or_else(|| TestingError::Other(anyhow::anyhow!("Watcher not initialized")))?;

        match receiver.recv_timeout(self.debounce) {
            Ok(Ok(event)) => {
                let event_type = if event.kind.is_create() {
                    FileChangeEventType::Created
                } else if event.kind.is_modify() {
                    FileChangeEventType::Modified
                } else if event.kind.is_remove() {
                    FileChangeEventType::Deleted
                } else {
                    FileChangeEventType::Any
                };

                Ok(Some(FileChangeEvent {
                    paths: event.paths,
                    event_type,
                    timestamp: std::time::Instant::now(),
                }))
            }
            Ok(Err(e)) => {
                warn!("Watch error: {:?}", e);
                Ok(None)
            }
            Err(std::sync::mpsc::RecvTimeoutError::Timeout) => Ok(None),
            Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                Err(TestingError::channel_error("Watch channel disconnected"))
            }
        }
    }

    pub fn start(&mut self) {
        self.running = true;
    }

    pub fn pause(&mut self) {
        self.running = false;
    }
}

impl Drop for TestWatcher {
    fn drop(&mut self) {
        self.stop();
    }
}

#[derive(Debug, Clone)]
pub struct WatchConfig {
    pub paths: Vec<PathBuf>,
    pub ignore_patterns: Vec<String>,
    pub include_patterns: Vec<String>,
    pub debounce_ms: u64,
}

impl Default for WatchConfig {
    fn default() -> Self {
        Self {
            paths: Vec::new(),
            ignore_patterns: vec!["target/**".to_string(), ".git/**".to_string()],
            include_patterns: vec!["**/*.rs".to_string()],
            debounce_ms: 100,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_watcher_creation() {
        let watcher = TestWatcher::new(Duration::from_millis(100));
        assert!(!watcher.is_running());
    }

    #[test]
    fn test_file_change_event() {
        let event = FileChangeEvent {
            paths: vec![PathBuf::from("src/test_example.rs")],
            event_type: FileChangeEventType::Modified,
            timestamp: std::time::Instant::now(),
        };

        assert!(event.is_test_file());
        assert!(!event.is_source_file());
    }

    #[test]
    fn test_watch_config_default() {
        let config = WatchConfig::default();
        assert!(!config.ignore_patterns.is_empty());
        assert!(!config.include_patterns.is_empty());
    }
}
