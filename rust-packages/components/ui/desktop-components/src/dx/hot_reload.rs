//! Hot reload support for development
//! 
//! Provides automatic reloading of code changes during development

use notify::{Watcher, RecursiveMode, watcher, DebouncedEvent, EventKind};
use std::sync::{Arc, Mutex};
use std::path::Path;
use std::time::Duration;

/// Hot reload callback type
pub type ReloadCallback = Box<dyn Fn(String) + Send + Sync>;

/// Hot reload manager
pub struct HotReloadManager {
    watcher: Option<notify::RecommendedWatcher>,
    callbacks: Arc<Mutex<Vec<(String, ReloadCallback)>>>>,
}

impl HotReloadManager {
    /// Create a new hot reload manager
    pub fn new() -> Self {
        Self {
            watcher: None,
            callbacks: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Add a callback for file changes
    pub fn add_callback<F>(&self, path: String, callback: F)
    where
        F: Fn(String) + Send + Sync + 'static,
    {
        let mut callbacks = self.callbacks.lock().unwrap();
        callbacks.push((path, Box::new(callback)));
    }

    /// Start watching a directory
    pub fn watch_directory<P: AsRef<Path>>(&mut self, path: P) -> Result<(), Box<dyn std::error::Error>> {
        let callbacks = self.callbacks.clone();
        
        let mut watcher = watcher(move |res| {
            match res {
                Ok(event) => {
                    if let DebouncedEvent::Write(path) = event {
                        let path_str = path.to_string_lossy().to_string();
                        let callbacks = callbacks.lock().unwrap();
                        for (watch_path, callback) in callbacks.iter() {
                            if path_str.starts_with(watch_path) {
                                callback(path_str.clone());
                            }
                        }
                    }
                }
                Err(e) => eprintln!("Watch error: {:?}", e),
            }
        }, Duration::from_millis(250))?;
        
        watcher.watch(path.as_ref(), RecursiveMode::Recursive)?;
        self.watcher = Some(watcher);
        
        Ok(())
    }

    /// Stop watching
    pub fn stop(&mut self) {
        self.watcher = None;
    }
}

impl Default for HotReloadManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hot_reload() {
        let manager = HotReloadManager::new();
        manager.add_callback("test".to_string(), |path| {
            println!("Reloaded: {}", path);
        });
    }
}
