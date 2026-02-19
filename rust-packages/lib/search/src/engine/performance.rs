use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::mpsc::{channel, Receiver};

pub fn watch(path: &Path) -> anyhow::Result<Receiver<notify::Result<notify::Event>>> {
    let (tx, rx) = channel();

    let mut watcher = RecommendedWatcher::new(tx, notify::Config::default())?;

    watcher.watch(path, RecursiveMode::Recursive)?;

    Ok(rx)
}
