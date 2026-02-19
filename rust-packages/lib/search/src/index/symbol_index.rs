use crate::index::{IndexMatch, IndexedFile, IndexedSymbol, SearchIndex};
use dashmap::DashMap;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

pub struct SymbolIndex {
    symbols: DashMap<String, Vec<IndexMatch>>,
    files: DashMap<PathBuf, IndexedFile>,
}

impl SymbolIndex {
    pub fn new() -> Self {
        Self {
            symbols: DashMap::new(),
            files: DashMap::new(),
        }
    }
    
    pub fn add_symbol(&self, symbol: IndexedSymbol, path: &PathBuf) {
        let m = IndexMatch {
            path: path.to_string_lossy().into_owned(),
            line: symbol.line,
            column: symbol.column,
            text: symbol.name.clone(),
            kind: symbol.kind.clone(),
            score: 1.0,
        };
        
        self.symbols
            .entry(symbol.name.clone())
            .or_insert_with(Vec::new)
            .push(m);
    }
    
    pub fn remove_symbols_for_file(&self, path: &PathBuf) {
        let path_str = path.to_string_lossy().into_owned();
        
        self.symbols.retain(|_, matches| {
            matches.retain(|m| m.path != path_str);
            !matches.is_empty()
        });
    }
    
    pub fn fuzzy_search(&self, query: &str, limit: usize) -> Vec<IndexMatch> {
        use fuzzy_matcher::FuzzyMatcher;
        use fuzzy_matcher::skim::SkimMatcherV2;
        
        let matcher = SkimMatcherV2::default();
        let mut results: Vec<(i64, IndexMatch)> = Vec::new();
        
        for entry in self.symbols.iter() {
            let (name, matches) = entry.pair();
            if let Some(score) = matcher.fuzzy_match(name, query) {
                for m in matches {
                    results.push((score, m.clone()));
                }
            }
        }
        
        results.sort_by(|a, b| b.0.cmp(&a.0));
        results.into_iter().take(limit).map(|(_, m)| m).collect()
    }
    
    pub fn search_by_prefix(&self, prefix: &str, limit: usize) -> Vec<IndexMatch> {
        let mut results = Vec::new();
        let prefix_lower = prefix.to_lowercase();
        
        for entry in self.symbols.iter() {
            let (name, matches) = entry.pair();
            if name.to_lowercase().starts_with(&prefix_lower) {
                results.extend(matches.clone());
                if results.len() >= limit {
                    break;
                }
            }
        }
        
        results.truncate(limit);
        results
    }
}

impl SearchIndex for SymbolIndex {
    fn search(&self, query: &str, limit: usize) -> Vec<IndexMatch> {
        let mut results: Vec<IndexMatch> = self.symbols
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
        let mut results: Vec<IndexMatch> = self.symbols
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
        self.remove_symbols_for_file(path);
        
        #[cfg(feature = "symbol")]
        {
            use crate::engine::symbol::extract_symbols;
            
            let symbols = extract_symbols(path)?;
            for sym in symbols {
                let indexed = IndexedSymbol {
                    name: sym.name,
                    kind: format!("{:?}", sym.kind).to_lowercase(),
                    line: sym.location.line,
                    column: sym.location.col,
                    signature: None,
                };
                self.add_symbol(indexed, path);
            }
        }
        
        let _ = content;
        Ok(())
    }
    
    fn remove_file(&self, path: &PathBuf) -> anyhow::Result<()> {
        self.remove_symbols_for_file(path);
        self.files.remove(path);
        Ok(())
    }
    
    fn stats(&self) -> crate::index::IndexStats {
        crate::index::IndexStats {
            total_files: self.files.len(),
            total_symbols: self.symbols.iter().map(|e| e.value().len()).sum(),
            total_size: 0,
            last_updated: 0,
            index_path: PathBuf::new(),
        }
    }
    
    fn persist(&self) -> anyhow::Result<()> {
        Ok(())
    }
    
    fn load(&self) -> anyhow::Result<()> {
        Ok(())
    }
}
