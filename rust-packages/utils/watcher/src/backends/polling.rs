use crate::{config::Config, error::Result, event::{Event, EventKind, ModifyKind}, filtering::PathFilter, traits::Watcher};
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::fs;
use std::time::SystemTime;
use tokio::sync::mpsc::Sender;
use tokio::time::{interval, Duration};
use log::{debug, error, info, trace};

#[derive(Clone, Debug)]
struct FileState {
    modified: SystemTime,
    size: u64,
    hash: Option<String>,
}

/// A watcher that periodically polls paths for changes.
pub struct PollWatcher {
    config: Config,
    tx: Sender<Result<Event>>,
    tracked_files: HashMap<PathBuf, FileState>,
    watched_roots: HashSet<PathBuf>,
    is_running: bool,
}

fn calculate_hash(path: &Path) -> Result<String> {
    let content = fs::read(path)?;
    Ok(blake3::hash(&content).to_hex().to_string())
}

#[async_trait::async_trait]
impl Backend for PollWatcher {
    fn new(config: Config, tx: Sender<Result<Event>>) -> Result<Self> {
        Ok(Self {
            config,
            tx,
            tracked_files: HashMap::new(),
            watched_roots: HashSet::new(),
            is_running: false,
        })
    }

    async fn watch(&mut self) -> Result<()> {
        self.is_running = true;
        let mut ticker = interval(self.config.polling.interval);

        while self.is_running {
            ticker.tick().await;
            trace!("Polling for changes...");
            if let Err(e) = self.scan_for_changes().await {
                error!("Error during polling scan: {}", e);
                let _ = self.tx.send(Err(e)).await;
            }
        }
        Ok(())
    }

    fn unwatch(&mut self) -> Result<()> {
        self.is_running = false;
        Ok(())
    }

    fn add_path(&mut self, path: &Path) -> Result<()> {
        info!("Adding path to poll watcher: {:?}", path);
        if self.watched_roots.insert(path.to_path_buf()) {
             self.scan_and_track_path(path)?;
        }
        Ok(())
    }

    fn remove_path(&mut self, path: &Path) -> Result<()> {
        info!("Removing path from poll watcher: {:?}", path);
        self.watched_roots.remove(path);
        self.tracked_files.retain(|p, _| !p.starts_with(path));
        Ok(())
    }

    fn configure(&mut self, config: Config) -> Result<()> {
        info!("Reconfiguring poll watcher.");
        self.config = config;
        Ok(())
    }
}

impl PollWatcher {
    fn scan_and_track_path(&mut self, path: &Path) -> Result<()> {
        let path_filter = PathFilter::new(self.config.filtering.clone(), path)?;
        let walker = ignore::WalkBuilder::new(path)
            .follow_links(self.config.follow_symlinks)
            .build();

        for entry in walker.filter_map(|e| e.ok()) {
            let entry_path = entry.path();
            if entry_path.is_file() && !path_filter.is_ignored(entry_path) {
                if let Ok(metadata) = entry.metadata() {
                    let state = self.create_file_state(entry_path, &metadata)?;
                    self.tracked_files.insert(entry_path.to_path_buf(), state);
                }
            }
        }
        Ok(())
    }

    async fn scan_for_changes(&mut self) -> Result<()> {
        let mut current_files = HashSet::new();
        let path_filter = PathFilter::new(self.config.filtering.clone(), &PathBuf::new())?; // Root is placeholder

        for root in self.watched_roots.clone() {
            let walker = ignore::WalkBuilder::new(&root)
                .follow_links(self.config.follow_symlinks)
                .build();

            for entry in walker.filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.is_file() && !path_filter.is_ignored(path) {
                    current_files.insert(path.to_path_buf());
                    self.check_file_for_modification(path).await?;
                }
            }
        }

        // Check for deleted files
        let tracked_paths: HashSet<_> = self.tracked_files.keys().cloned().collect();
        for deleted_path in tracked_paths.difference(&current_files) {
            debug!("File deleted: {:?}", deleted_path);
            self.tracked_files.remove(deleted_path);
            self.send_event(EventKind::Remove, vec![deleted_path.clone()]).await?;
        }

        Ok(())
    }

    async fn check_file_for_modification(&mut self, path: &Path) -> Result<()> {
        let metadata = fs::metadata(path)?;
        let new_state = self.create_file_state(path, &metadata)?;

        if let Some(old_state) = self.tracked_files.get(path) {
            // File exists, check for modification
            if new_state.modified > old_state.modified || (self.config.polling.compare_contents && new_state.hash != old_state.hash) {
                debug!("File modified: {:?}", path);
                self.tracked_files.insert(path.to_path_buf(), new_state);
                self.send_event(EventKind::Modify(ModifyKind::Content), vec![path.to_path_buf()]).await?;
            }
        } else {
            // New file detected
            debug!("File created: {:?}", path);
            self.tracked_files.insert(path.to_path_buf(), new_state);
            self.send_event(EventKind::Create, vec![path.to_path_buf()]).await?;
        }
        Ok(())
    }

    fn create_file_state(&self, path: &Path, metadata: &fs::Metadata) -> Result<FileState> {
        let hash = if self.config.polling.compare_contents {
            calculate_hash(path).ok()
        } else {
            None
        };
        Ok(FileState {
            modified: metadata.modified()?,
            size: metadata.len(),
            hash,
        })
    }

    async fn send_event(&self, kind: EventKind, paths: Vec<PathBuf>) -> Result<()> {
        let event = Event { kind, paths, time: SystemTime::now(), metadata: None };
        if self.tx.send(Ok(event)).await.is_err() {
            error!("Event channel closed, stopping poll watcher.");
            // This error should be propagated up to stop the watch loop.
            return Err(crate::error::WatcherError::Channel("Receiver dropped".to_string()));
        }
        Ok(())
    }
}
