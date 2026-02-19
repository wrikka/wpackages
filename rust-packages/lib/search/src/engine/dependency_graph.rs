#[cfg(feature = "symbol")]
use crate::engine::symbol;
#[cfg(feature = "symbol")]
use ignore::{WalkParallel, WalkState, WalkError};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
#[cfg(feature = "symbol")]
use std::str::Utf8Error;
#[cfg(feature = "symbol")]
use std::sync::{Arc, Mutex};
use thiserror::Error;
#[cfg(feature = "symbol")]
use tree_sitter::{Language, LanguageError, Parser, Query, QueryCursor, QueryError};

#[cfg(feature = "symbol")]
#[derive(Error, Debug)]
pub enum DependencyGraphError {
    #[error("directory walk error: {0}")]
    Walk(#[from] WalkError),
    #[error("I/O error reading file {0}: {1}")]
    Io(PathBuf, std::io::Error),
    #[error("tree-sitter language error: {0}")]
    Language(#[from] LanguageError),
    #[error("tree-sitter query error: {0}")]
    Query(#[from] QueryError),
    #[error("UTF-8 error in file {0}: {1}")]
    Utf8(PathBuf, Utf8Error),
    #[error("Mutex was poisoned during parallel search")]
    MutexPoisoned,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyNode {
    pub path: String,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyGraph {
    adj: HashMap<String, HashSet<String>>,
}

#[cfg(feature = "symbol")]
fn get_import_queries(lang: tree_sitter::Language) -> Vec<Query> {
    let queries = [
        "(use_declaration path: (_) @path)",
        "(import_statement source: (string) @path)",
        "(import_statement name: (dotted_name) @path)",
        "(import_declaration path: (interpreted_string_literal) @path)",
    ];
    queries
        .iter()
        .filter_map(|q| Query::new(lang, q).ok())
        .collect()
}

#[cfg(feature = "symbol")]
fn resolve_path(base: &Path, import_path: &str) -> Option<String> {
    let mut path_buf = base.parent()?.to_path_buf();
    path_buf.push(import_path.trim_matches(|c| c == '"' || c == '\''));

    const EXTENSIONS: &[&str] = &["", ".rs", ".js", ".ts", ".py", ".go"];
    for ext in EXTENSIONS {
        let mut temp_path = path_buf.clone();
        if !ext.is_empty() {
            let current_ext = temp_path.extension().unwrap_or_default();
            if current_ext != *ext {
                temp_path.set_extension(ext);
            }
        }
        if temp_path.exists() {
            return Some(temp_path.to_string_lossy().into_owned());
        }
    }
    None
}

#[cfg(feature = "symbol")]
pub fn build(root: &str) -> Result<DependencyGraph, DependencyGraphError> {
    let adj = Mutex::new(HashMap::new());
    let error_store = Mutex::new(None::<DependencyGraphError>);
    let query_cache: Mutex<HashMap<Language, Arc<Vec<Query>>>> = Mutex::new(HashMap::new());

    let walker = WalkParallel::new(root);
    walker.run(|| {
        let mut parser = Parser::new();
        Box::new(|entry| {
            if let Ok(guard) = error_store.lock() {
                if guard.is_some() {
                    return WalkState::Quit;
                }
            } else {
                return WalkState::Quit;
            }

            let set_error = |e: DependencyGraphError| -> WalkState {
                if let Ok(mut guard) = error_store.lock() {
                    if guard.is_none() {
                        *guard = Some(e);
                    }
                }
                WalkState::Quit
            };

            let entry = match entry {
                Ok(e) => e,
                Err(e) => return set_error(e.into()),
            };

            if !entry.file_type().map_or(false, |t| t.is_file()) {
                return WalkState::Continue;
            }

            let path = entry.path();

            let Some(language) = symbol::get_language(path) else { return WalkState::Continue };

            let queries = {
                let mut query_guard = match query_cache.lock() {
                    Ok(q) => q,
                    Err(_) => return set_error(DependencyGraphError::MutexPoisoned),
                };
                if let Some(q) = query_guard.get(&language) {
                    q.clone()
                } else {
                    let new_queries = Arc::new(get_import_queries(language));
                    query_guard.insert(language, new_queries.clone());
                    new_queries
                }
            };

            if let Err(e) = parser.set_language(language) {
                return set_error(e.into());
            }

            let code = match std::fs::read_to_string(path) {
                Ok(c) => c,
                Err(_) => return WalkState::Continue,
            };

            let Some(tree) = parser.parse(&code, None) else { return WalkState::Continue };

            let mut dependencies = HashSet::new();
            for query in queries.iter() {
                let mut cursor = QueryCursor::new();
                for m in cursor.matches(query, tree.root_node(), code.as_bytes()) {
                    for cap in m.captures {
                        let import_path = match cap.node.utf8_text(code.as_bytes()) {
                            Ok(text) => text,
                            Err(e) => return set_error(DependencyGraphError::Utf8(path.to_path_buf(), e)),
                        };
                        if let Some(resolved) = resolve_path(path, import_path) {
                            dependencies.insert(resolved);
                        }
                    }
                }
            }

            if let Ok(mut adj_guard) = adj.lock() {
                adj_guard.insert(path.to_string_lossy().into_owned(), dependencies);
            } else {
                return set_error(DependencyGraphError::MutexPoisoned);
            }

            WalkState::Continue
        })
    });

    if let Some(err) = error_store.into_inner().map_err(|_| DependencyGraphError::MutexPoisoned)? {
        return Err(err);
    }

    let final_adj = adj.into_inner().map_err(|_| DependencyGraphError::MutexPoisoned)?;
    Ok(DependencyGraph { adj: final_adj })
}

#[cfg(not(feature = "symbol"))]
pub fn build(root: &str) -> Result<DependencyGraph, anyhow::Error> {
    Ok(DependencyGraph { adj: HashMap::new() })
}
