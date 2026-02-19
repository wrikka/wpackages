pub mod symbol_index;
pub mod text_index;
pub mod watcher;

use dashmap::DashMap;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedFile {
    pub path: PathBuf,
    pub hash: String,
    pub last_modified: u64,
    pub symbols: Vec<IndexedSymbol>,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedSymbol {
    pub name: String,
    pub kind: String,
    pub line: usize,
    pub column: usize,
    pub signature: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
    pub total_files: usize,
    pub total_symbols: usize,
    pub total_size: u64,
    pub last_updated: u64,
    pub index_path: PathBuf,
}

pub trait SearchIndex: Send + Sync {
    fn search(&self, query: &str, limit: usize) -> Vec<IndexMatch>;
    fn search_by_kind(&self, kind: &str, query: &str, limit: usize) -> Vec<IndexMatch>;
    fn update_file(&self, path: &PathBuf, content: &str) -> anyhow::Result<()>;
    fn remove_file(&self, path: &PathBuf) -> anyhow::Result<()>;
    fn stats(&self) -> IndexStats;
    fn persist(&self) -> anyhow::Result<()>;
    fn load(&self) -> anyhow::Result<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexMatch {
    pub path: String,
    pub line: usize,
    pub column: usize,
    pub text: String,
    pub kind: String,
    pub score: f64,
}

pub struct InMemoryIndex {
    files: DashMap<PathBuf, IndexedFile>,
    symbol_map: DashMap<String, Vec<IndexMatch>>,
    root: PathBuf,
    index_path: PathBuf,
}

impl InMemoryIndex {
    pub fn new(root: PathBuf) -> Self {
        let index_path = root.join(".codesearch").join("index.bin");
        Self {
            files: DashMap::new(),
            symbol_map: DashMap::new(),
            root,
            index_path,
        }
    }
    
    pub fn with_path(root: PathBuf, index_path: PathBuf) -> Self {
        Self {
            files: DashMap::new(),
            symbol_map: DashMap::new(),
            root,
            index_path,
        }
    }
}

impl SearchIndex for InMemoryIndex {
    fn search(&self, query: &str, limit: usize) -> Vec<IndexMatch> {
        let mut results: Vec<IndexMatch> = self.symbol_map
            .iter()
            .filter_map(|entry| {
                let (name, matches) = entry.pair();
                if name.to_lowercase().contains(&query.to_lowercase()) {
                    Some(matches.clone())
                } else {
                    None
                }
            })
            .flatten()
            .collect();
        
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(limit);
        results
    }
    
    fn search_by_kind(&self, kind: &str, query: &str, limit: usize) -> Vec<IndexMatch> {
        let mut results: Vec<IndexMatch> = self.symbol_map
            .iter()
            .filter_map(|entry| {
                let (name, matches) = entry.pair();
                if name.to_lowercase().contains(&query.to_lowercase()) {
                    let filtered: Vec<IndexMatch> = matches
                        .iter()
                        .filter(|m| m.kind == kind)
                        .cloned()
                        .collect();
                    if !filtered.is_empty() {
                        Some(filtered)
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
            .flatten()
            .collect();
        
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(limit);
        results
    }
    
    fn update_file(&self, path: &PathBuf, content: &str) -> anyhow::Result<()> {
        use std::fs;
        
        let hash = blake3_hash(content);
        let metadata = fs::metadata(path)?;
        let last_modified = metadata.modified()?.duration_since(std::time::UNIX_EPOCH)?.as_secs();
        let size = metadata.len();
        
        let old_file = self.files.get(path).map(|f| f.clone());
        if let Some(old) = old_file {
            for symbol in old.symbols {
                if let Some(mut matches) = self.symbol_map.get_mut(&symbol.name) {
                    matches.retain(|m| m.path != path.to_string_lossy());
                }
            }
        }
        
        #[cfg(feature = "symbol")]
        {
            let symbols = extract_symbols_from_content(path, content)?;
            
            let indexed_symbols: Vec<IndexedSymbol> = symbols
                .iter()
                .map(|s| IndexedSymbol {
                    name: s.name.clone(),
                    kind: format!("{:?}", s.kind).to_lowercase(),
                    line: s.location.line,
                    column: s.location.col,
                    signature: None,
                })
                .collect();
            
            for sym in &indexed_symbols {
                let m = IndexMatch {
                    path: path.to_string_lossy().into_owned(),
                    line: sym.line,
                    column: sym.column,
                    text: sym.name.clone(),
                    kind: sym.kind.clone(),
                    score: 1.0,
                };
                
                self.symbol_map
                    .entry(sym.name.clone())
                    .or_insert_with(Vec::new)
                    .push(m);
            }
            
            let indexed_file = IndexedFile {
                path: path.clone(),
                hash,
                last_modified,
                symbols: indexed_symbols,
                size,
            };
            
            self.files.insert(path.clone(), indexed_file);
        }
        
        #[cfg(not(feature = "symbol"))]
        {
            let indexed_file = IndexedFile {
                path: path.clone(),
                hash,
                last_modified,
                symbols: Vec::new(),
                size,
            };
            
            self.files.insert(path.clone(), indexed_file);
        }
        
        Ok(())
    }
    
    fn remove_file(&self, path: &PathBuf) -> anyhow::Result<()> {
        if let Some((_, file)) = self.files.remove(path) {
            for symbol in file.symbols {
                if let Some(mut matches) = self.symbol_map.get_mut(&symbol.name) {
                    matches.retain(|m| m.path != path.to_string_lossy());
                }
            }
        }
        Ok(())
    }
    
    fn stats(&self) -> IndexStats {
        let total_files = self.files.len();
        let total_symbols: usize = self.files.iter().map(|f| f.symbols.len()).sum();
        let total_size: u64 = self.files.iter().map(|f| f.size).sum();
        let last_updated = self.files
            .iter()
            .map(|f| f.last_modified)
            .max()
            .unwrap_or(0);
        
        IndexStats {
            total_files,
            total_symbols,
            total_size,
            last_updated,
            index_path: self.index_path.clone(),
        }
    }
    
    fn persist(&self) -> anyhow::Result<()> {
        if let Some(parent) = self.index_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        
        let files: HashMap<PathBuf, IndexedFile> = self.files
            .iter()
            .map(|entry| (entry.key().clone(), entry.value().clone()))
            .collect();
        
        let encoded = bincode::serialize(&files)?;
        std::fs::write(&self.index_path, encoded)?;
        
        Ok(())
    }
    
    fn load(&self) -> anyhow::Result<()> {
        if !self.index_path.exists() {
            return Ok(());
        }
        
        let encoded = std::fs::read(&self.index_path)?;
        let files: HashMap<PathBuf, IndexedFile> = bincode::deserialize(&encoded)?;
        
        for (path, file) in files {
            for symbol in &file.symbols {
                let m = IndexMatch {
                    path: path.to_string_lossy().into_owned(),
                    line: symbol.line,
                    column: symbol.column,
                    text: symbol.name.clone(),
                    kind: symbol.kind.clone(),
                    score: 1.0,
                };
                
                self.symbol_map
                    .entry(symbol.name.clone())
                    .or_insert_with(Vec::new)
                    .push(m);
            }
            
            self.files.insert(path, file);
        }
        
        Ok(())
    }
}

fn blake3_hash(content: &str) -> String {
    #[cfg(feature = "semantic")]
    {
        let hash = blake3::hash(content.as_bytes());
        hash.to_hex().to_string()
    }
    
    #[cfg(not(feature = "semantic"))]
    {
        let _ = content;
        String::new()
    }
}

#[cfg(feature = "symbol")]
fn extract_symbols_from_content(path: &PathBuf, content: &str) -> anyhow::Result<Vec<crate::engine::symbol::Symbol>> {
    use crate::engine::symbol::{extract_symbols, Symbol};
    
    let symbols = extract_symbols(path)?;
    Ok(symbols)
}
