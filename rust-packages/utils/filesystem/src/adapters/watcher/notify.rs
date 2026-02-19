//! Notify-based file watcher adapter

use crate::error::{FsError, FsResult};
use async_stream::stream;
use camino::{Utf8Path, Utf8PathBuf};
use futures_util::stream::Stream;
use notify::{
    event::ModifyKind, Event, EventKind, RecommendedWatcher, RecursiveMode,
    Watcher as NotifyWatcher,
};
use std::path::PathBuf;
use std::sync::mpsc;
use tokio::sync::mpsc as tokio_mpsc;
use super::events::{WatchEvent, WatchEventType};

/// Notify-based file watcher
pub struct NotifyWatcher {
    config: super::config::WatcherConfig,
}

impl NotifyWatcher {
    /// Create new notify watcher
    pub fn new(config: super::config::WatcherConfig) -> Self {
        Self { config }
    }

    /// Watch a path for changes
    pub async fn watch(
        &self,
        path: impl AsRef<Utf8Path>,
        recursive: bool,
    ) -> FsResult<impl Stream<Item = FsResult<WatchEvent>>> {
        let path = path.as_ref().to_path_buf();
        let (tx, mut rx) = tokio_mpsc::channel::<FsResult<WatchEvent>>(16);

        std::thread::spawn(move || {
            let (sync_tx, sync_rx) = mpsc::channel();
            
            let mut watcher: RecommendedWatcher = match NotifyWatcher::new(
                move |res| {
                    if let Err(e) = sync_tx.send(res) {
                        eprintln!("Error sending watch event: {}", e);
                    }
                },
                notify::Config::default(),
            ) {
                Ok(w) => w,
                Err(e) => {
                    let _ = tx.blocking_send(Err(e.into()));
                    return;
                }
            };

            let mode = if recursive {
                RecursiveMode::Recursive
            } else {
                RecursiveMode::NonRecursive
            };

            if let Err(e) = watcher.watch(path.as_std_path(), mode) {
                let _ = tx.blocking_send(Err(e.into()));
                return;
            }

            for res in sync_rx {
                let event_result = match res {
                    Ok(event) => translate_event(event),
                    Err(e) => Some(Err(e.into())),
                };

                if let Some(res) = event_result {
                    if tx.blocking_send(res).is_err() {
                        break;
                    }
                }
            }
        });

        Ok(stream! {
            while let Some(event) = rx.recv().await {
                yield event;
            }
        })
    }

    /// Watch multiple paths
    pub async fn watch_multiple(
        &self,
        paths: &[impl AsRef<Utf8Path>],
        recursive: bool,
    ) -> FsResult<impl Stream<Item = FsResult<WatchEvent>>> {
        let streams: Vec<_> = paths
            .iter()
            .map(|path| self.watch(path, recursive))
            .collect();

        Ok(futures_util::stream::select_all(streams))
    }

    /// Watch with filtering
    pub async fn watch_filtered<F>(
        &self,
        path: impl AsRef<Utf8Path>,
        recursive: bool,
        filter: F,
    ) -> FsResult<impl Stream<Item = FsResult<WatchEvent>>>
    where
        F: Fn(&WatchEvent) -> bool + Send + Sync + 'static,
    {
        let base_stream = self.watch(path, recursive).await?;
        
        Ok(base_stream.filter(move |result| {
            match result {
                Ok(event) => filter(event),
                Err(_) => true, // Always include errors
            }
        }))
    }
}

/// Translate notify event to our event type
fn translate_event(event: Event) -> Option<FsResult<WatchEvent>> {
    let paths: Vec<_> = event
        .paths
        .into_iter()
        .map(|path| {
            Utf8PathBuf::from_path_buf(&path)
                .map_err(|p| FsError::InvalidUtf8 { path: p })
        })
        .collect::<Result<_, _>>()
        .ok()?;

    let watch_event = match event.kind {
        EventKind::Create(_) => paths.into_iter().next().map(|path| {
            Ok(WatchEvent {
                path,
                event_type: WatchEventType::Created,
                timestamp: chrono::Utc::now(),
            })
        }),
        EventKind::Remove(_) => paths.into_iter().next().map(|path| {
            Ok(WatchEvent {
                path,
                event_type: WatchEventType::Deleted,
                timestamp: chrono::Utc::now(),
            })
        }),
        EventKind::Modify(ModifyKind::Name(notify::event::RenameMode::Both)) => {
            if paths.len() == 2 {
                let mut iter = paths.into_iter();
                Some(Ok(WatchEvent {
                    path: iter.next().unwrap(),
                    event_type: WatchEventType::Renamed {
                        from: iter.next().unwrap(),
                        to: iter.next().unwrap(),
                    },
                    timestamp: chrono::Utc::now(),
                }))
            } else {
                None
            }
        }
        EventKind::Modify(_) => paths.into_iter().next().map(|path| {
            Ok(WatchEvent {
                path,
                event_type: WatchEventType::Modified,
                timestamp: chrono::Utc::now(),
            })
        }),
        _ => None,
    };

    watch_event
}

/// Watcher factory for creating different types of watchers
pub struct WatcherFactory;

impl WatcherFactory {
    /// Create notify watcher with default config
    pub fn create_notify() -> NotifyWatcher {
        NotifyWatcher::new(super::config::WatcherConfig::default())
    }

    /// Create notify watcher with custom config
    pub fn create_notify_with_config(config: super::config::WatcherConfig) -> NotifyWatcher {
        NotifyWatcher::new(config)
    }

    /// Create poll-based watcher (fallback)
    pub fn create_poll() -> PollWatcher {
        PollWatcher::new(super::config::WatcherConfig::default())
    }
}

/// Poll-based file watcher (fallback implementation)
pub struct PollWatcher {
    config: super::config::WatcherConfig,
}

impl PollWatcher {
    /// Create new poll watcher
    pub fn new(config: super::config::WatcherConfig) -> Self {
        Self { config }
    }

    /// Watch a path using polling
    pub async fn watch(
        &self,
        path: impl AsRef<Utf8Path>,
        _recursive: bool,
    ) -> FsResult<impl Stream<Item = FsResult<WatchEvent>>> {
        let path = path.as_ref().to_path_buf();
        let (tx, mut rx) = tokio_mpsc::channel::<FsResult<WatchEvent>>(16);

        tokio::spawn(async move {
            let mut last_state = std::collections::HashMap::new();
            
            loop {
                // Check for changes
                let current_state = get_directory_state(&path).await;
                
                for (file_path, metadata) in &current_state {
                    match last_state.get(file_path) {
                        Some(last_metadata) => {
                            if metadata != last_metadata {
                                let event = Ok(WatchEvent {
                                    path: file_path.clone(),
                                    event_type: WatchEventType::Modified,
                                    timestamp: chrono::Utc::now(),
                                });
                                if tx.blocking_send(event).is_err() {
                                    break;
                                }
                            }
                        }
                        None => {
                            let event = Ok(WatchEvent {
                                path: file_path.clone(),
                                event_type: WatchEventType::Created,
                                timestamp: chrono::Utc::now(),
                            });
                            if tx.blocking_send(event).is_err() {
                                break;
                            }
                        }
                    }
                }

                // Check for deletions
                for file_path in last_state.keys() {
                    if !current_state.contains_key(file_path) {
                        let event = Ok(WatchEvent {
                            path: file_path.clone(),
                            event_type: WatchEventType::Deleted,
                            timestamp: chrono::Utc::now(),
                        });
                        if tx.blocking_send(event).is_err() {
                            break;
                        }
                    }
                }

                last_state = current_state;
                tokio::time::sleep(tokio::time::Duration::from_millis(
                    self.config.poll_interval_ms
                )).await;
            }
        });

        Ok(stream! {
            while let Some(event) = rx.recv().await {
                yield event;
            }
        })
    }
}

/// Get current directory state
async fn get_directory_state(path: &PathBuf) -> std::collections::HashMap<Utf8PathBuf, std::fs::Metadata> {
    let mut state = std::collections::HashMap::new();
    
    if let Ok(entries) = tokio::fs::read_dir(path).await {
        for entry in entries.flatten() {
            if let Ok(entry) = entry {
                if let Ok(metadata) = entry.metadata().await {
                    if let Ok(utf8_path) = Utf8PathBuf::from_path_buf(entry.path()) {
                        state.insert(utf8_path, metadata);
                    }
                }
            }
        }
    }
    
    state
}
