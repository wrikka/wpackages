use crate::{config::Config, error::{Result, WatcherError}, event::{Event, EventKind, ModifyKind}, traits::Watcher};
use inotify::{Inotify, WatchMask};
use log::{debug, error};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::SystemTime;
use tokio::sync::mpsc::{self, Sender};

/// A watcher that uses inotify for filesystem notifications on Linux.
pub struct NativeLinuxWatcher {
    config: Config,
    tx: Sender<Result<Event>>,
    inotify: Arc<Mutex<Inotify>>,
    watch_descriptors: Arc<Mutex<HashMap<PathBuf, inotify::WatchDescriptor>>>,
    stop_tx: Option<mpsc::Sender<()>>,
}

#[async_trait::async_trait]
impl Backend for NativeLinuxWatcher {
    fn new(config: Config, tx: Sender<Result<Event>>) -> Result<Self> {
        let inotify = Inotify::init().map_err(|e| WatcherError::Backend(e.to_string()))?;
        Ok(Self {
            config,
            tx,
            inotify: Arc::new(Mutex::new(inotify)),
            watch_descriptors: Arc::new(Mutex::new(HashMap::new())),
            stop_tx: None,
        })
    }

    async fn watch(&mut self) -> Result<()> {
        let (stop_tx, mut stop_rx) = mpsc::channel(1);
        self.stop_tx = Some(stop_tx);

        let event_tx = self.tx.clone();
        let inotify = self.inotify.clone();

        thread::spawn(move || {
            let mut buffer = [0u8; 4096];
            loop {
                if stop_rx.try_recv().is_ok() {
                    debug!("Stopping Linux native watcher thread.");
                    break;
                }

                let events = match inotify.lock().unwrap().read_events_blocking(&mut buffer) {
                    Ok(events) => events,
                    Err(e) => {
                        error!("Inotify read error: {}", e);
                        let _ = event_tx.blocking_send(Err(WatcherError::Backend(e.to_string())));
                        break;
                    }
                };

                for inotify_event in events {
                    let kind = match inotify_event.mask {
                        mask if mask.contains(WatchMask::CREATE) => EventKind::Create,
                        mask if mask.contains(WatchMask::DELETE) => EventKind::Remove,
                        mask if mask.contains(WatchMask::MODIFY) => EventKind::Modify(ModifyKind::Content),
                        _ => EventKind::Other,
                    };
                    
                    let path = inotify_event.name.map(PathBuf::from).unwrap_or_default();

                    let event = Event {
                        kind,
                        paths: vec![path],
                        time: SystemTime::now(),
                        metadata: None,
                    };
                    if event_tx.blocking_send(Ok(event)).is_err() {
                        error!("Failed to send event from Linux native watcher thread.");
                    }
                }
            }
        });

        Ok(())
    }

    fn unwatch(&mut self) -> Result<()> {
        if let Some(stop_tx) = self.stop_tx.take() {
            let _ = stop_tx.blocking_send(());
        }
        Ok(())
    }

    fn add_path(&mut self, path: &Path) -> Result<()> {
        let wd = self.inotify.lock().unwrap().add_watch(
            path,
            WatchMask::CREATE | WatchMask::DELETE | WatchMask::MODIFY,
        ).map_err(|e| WatcherError::Backend(e.to_string()))?;
        self.watch_descriptors.lock().unwrap().insert(path.to_path_buf(), wd);
        Ok(())
    }

    fn remove_path(&mut self, path: &Path) -> Result<()> {
        if let Some(wd) = self.watch_descriptors.lock().unwrap().remove(path) {
            self.inotify.lock().unwrap().rm_watch(wd).map_err(|e| WatcherError::Backend(e.to_string()))?;
        }
        Ok(())
    }

    fn configure(&mut self, config: Config) -> Result<()> {
        self.config = config;
        Ok(())
    }
}

