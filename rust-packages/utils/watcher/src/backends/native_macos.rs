use crate::{config::Config, error::{Result, WatcherError}, event::{Event, EventKind, ModifyKind}, traits::Watcher};
use fsevent_stream::ffi::{kFSEventStreamCreateFlagFileEvents, kFSEventStreamEventIdSinceNow};
use fsevent_stream::{Event as FsEvent, FsEventCallback, FsEventFlags, FsEventStream};
use log::{debug, error};
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::SystemTime;
use tokio::sync::mpsc::{self, Sender};

/// A watcher that uses FSEvents for filesystem notifications on macOS.
pub struct NativeMacosWatcher {
    config: Config,
    tx: Sender<Result<Event>>,
    watched_paths: Arc<Mutex<HashSet<PathBuf>>>,
    stop_tx: Option<mpsc::Sender<()>>,
    stream: Option<FsEventStream>,
}

#[async_trait::async_trait]
impl Backend for NativeMacosWatcher {
    fn new(config: Config, tx: Sender<Result<Event>>) -> Result<Self> {
        Ok(Self {
            config,
            tx,
            watched_paths: Arc::new(Mutex::new(HashSet::new())),
            stop_tx: None,
            stream: None,
        })
    }

    async fn watch(&mut self) -> Result<()> {
        let (stop_tx, mut stop_rx) = mpsc::channel(1);
        self.stop_tx = Some(stop_tx);

        let event_tx = self.tx.clone();
        let paths_to_watch = self.watched_paths.lock().unwrap().iter().cloned().collect::<Vec<_>>();

        let callback: FsEventCallback = Arc::new(move |events| {
            for fsevent in events {
                let event = translate_event(fsevent);
                if event_tx.blocking_send(Ok(event)).is_err() {
                    error!("Failed to send event from macOS native watcher thread.");
                }
            }
        });

        let stream = FsEventStream::new(
            callback,
            &paths_to_watch,
            kFSEventStreamEventIdSinceNow,
            self.config.polling.interval, // Latency
            kFSEventStreamCreateFlagFileEvents,
        ).map_err(|e| WatcherError::Backend(e.to_string()))?;
        
        self.stream = Some(stream);

        thread::spawn(move || {
            debug!("Starting macOS native watcher thread.");
            // The stream runs on its own thread, we just need to keep this thread alive
            // until we receive a stop signal.
            let _ = stop_rx.blocking_recv();
            debug!("Stopping macOS native watcher thread.");
        });

        Ok(())
    }

    fn unwatch(&mut self) -> Result<()> {
        if let Some(stop_tx) = self.stop_tx.take() {
            let _ = stop_tx.blocking_send(());
        }
        if let Some(mut stream) = self.stream.take() {
            stream.stop();
        }
        Ok(())
    }

    fn add_path(&mut self, path: &Path) -> Result<()> {
        self.watched_paths.lock().unwrap().insert(path.to_path_buf());
        // In a real implementation, we would restart the stream if it's already running.
        Ok(())
    }

    fn remove_path(&mut self, path: &Path) -> Result<()> {
        self.watched_paths.lock().unwrap().remove(path);
        // In a real implementation, we would restart the stream if it's already running.
        Ok(())
    }

    fn configure(&mut self, config: Config) -> Result<()> {
        self.config = config;
        Ok(())
    }
}

fn translate_event(fsevent: &FsEvent) -> Event {
    let path = PathBuf::from(&fsevent.path);
    let flags = &fsevent.flags;

    let kind = if flags.contains(FsEventFlags::ITEM_CREATED) {
        EventKind::Create
    } else if flags.contains(FsEventFlags::ITEM_REMOVED) {
        EventKind::Remove
    } else if flags.contains(FsEventFlags::ITEM_RENAMED) {
        // FSEvents doesn't easily distinguish between from/to
        EventKind::Rename(crate::event::RenameKind::Any)
    } else if flags.contains(FsEventFlags::ITEM_MODIFIED) || flags.contains(FsEventFlags::ITEM_XATTR_MOD) {
        EventKind::Modify(ModifyKind::Any)
    } else {
        EventKind::Other
    };

    Event {
        kind,
        paths: vec![path],
        time: SystemTime::now(),
        metadata: None,
    }
}

