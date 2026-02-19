use crate::prelude::AppError;
use notify::{recommended_watcher, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::mpsc::channel;
use std::time::Duration;
use tracing::instrument;

#[instrument(skip(callback))]
pub fn watch_extensions_dir<F>(dir: &Path, callback: F) -> Result<impl Watcher, AppError>
where
    F: Fn() + Send + 'static,
{
    let (tx, rx) = channel();

    let mut watcher = recommended_watcher(tx)?;

    watcher.watch(dir, RecursiveMode::Recursive)?;

    std::thread::spawn(move || {
        // Debounce events to avoid multiple reloads for a single save action.
        let mut last_event_time = std::time::Instant::now();
        let debounce_duration = Duration::from_secs(1);

        for res in rx {
            match res {
                Ok(_event) => {
                    if last_event_time.elapsed() > debounce_duration {
                        tracing::info!("Detected change in extensions directory, triggering reload.");
                        callback();
                        last_event_time = std::time::Instant::now();
                    }
                }
                Err(e) => tracing::error!("Watch error: {:?}", e),
            }
        }
    });

    Ok(watcher)
}
