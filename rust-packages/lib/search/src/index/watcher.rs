use crate::index::{InMemoryIndex, SearchIndex};
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;
use tracing::{debug, error, info, warn};

pub struct IndexWatcher {
    watcher: RecommendedWatcher,
    index: Arc<InMemoryIndex>,
    root: PathBuf,
}

impl IndexWatcher {
    pub fn new(root: PathBuf, index: Arc<InMemoryIndex>) -> anyhow::Result<Self> {
        let (tx, mut rx) = mpsc::channel::<Event>(1024);
        let index_clone = index.clone();
        let root_clone = root.clone();
        
        let watcher = RecommendedWatcher::new(
            move |res: Result<Event, notify::Error>| {
                if let Ok(event) = res {
                    let _ = tx.blocking_send(event);
                }
            },
            Config::default()
                .with_poll_interval(Duration::from_millis(500))
                .with_compare_contents(true),
        )?;
        
        tokio::spawn(async move {
            while let Some(event) = rx.recv().await {
                handle_file_event(&index_clone, &root_clone, event);
            }
        });
        
        Ok(Self {
            watcher,
            index,
            root,
        })
    }
    
    pub fn start(&mut self) -> anyhow::Result<()> {
        self.watcher.watch(&self.root, RecursiveMode::Recursive)?;
        info!("Started watching: {:?}", self.root);
        Ok(())
    }
    
    pub fn stop(&mut self) -> anyhow::Result<()> {
        self.watcher.unwatch(&self.root)?;
        info!("Stopped watching: {:?}", self.root);
        Ok(())
    }
    
    pub async fn initial_index(&self) -> anyhow::Result<usize> {
        use ignore::WalkBuilder;
        use std::fs;
        
        let mut indexed_count = 0;
        
        for entry in WalkBuilder::new(&self.root)
            .hidden(false)
            .git_ignore(true)
            .git_global(true)
            .git_exclude(true)
            .build()
            .flatten()
        {
            let path = entry.path();
            
            if !path.is_file() {
                continue;
            }
            
            let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
            if !is_code_file(ext) {
                continue;
            }
            
            if let Ok(content) = fs::read_to_string(path) {
                if self.index.update_file(&path.to_path_buf(), &content).is_ok() {
                    indexed_count += 1;
                }
            }
        }
        
        self.index.persist()?;
        info!("Initial indexing complete: {} files", indexed_count);
        
        Ok(indexed_count)
    }
}

fn handle_file_event(index: &Arc<InMemoryIndex>, root: &PathBuf, event: Event) {
    let paths: Vec<PathBuf> = event.paths
        .iter()
        .filter(|p| {
            if let Some(ext) = p.extension().and_then(|e| e.to_str()) {
                is_code_file(ext)
            } else {
                false
            }
        })
        .cloned()
        .collect();
    
    if paths.is_empty() {
        return;
    }
    
    match event.kind {
        EventKind::Create(_) | EventKind::Modify(_) => {
            for path in paths {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    debug!("Updating index for: {:?}", path);
                    if let Err(e) = index.update_file(&path, &content) {
                        warn!("Failed to update index for {:?}: {}", path, e);
                    }
                }
            }
        }
        EventKind::Remove(_) => {
            for path in paths {
                debug!("Removing from index: {:?}", path);
                if let Err(e) = index.remove_file(&path) {
                    warn!("Failed to remove from index {:?}: {}", path, e);
                }
            }
        }
        _ => {}
    }
    
    if let Err(e) = index.persist() {
        error!("Failed to persist index: {}", e);
    }
}

fn is_code_file(ext: &str) -> bool {
    matches!(
        ext,
        "rs" | "ts" | "tsx" | "js" | "jsx" | "py" | "go" | 
        "java" | "kt" | "scala" | "c" | "cpp" | "h" | "hpp" |
        "cs" | "rb" | "php" | "swift" | "m" | "mm" | "r" |
        "lua" | "vim" | "sh" | "bash" | "zsh" | "fish" |
        "json" | "yaml" | "yml" | "toml" | "xml" | "html" |
        "css" | "scss" | "sass" | "less" | "md" | "txt"
    )
}
