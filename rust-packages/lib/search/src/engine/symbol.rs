use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use thiserror::Error;

#[cfg(feature = "symbol")]
use {
    ignore::{WalkParallel, WalkState, WalkError},
    rayon::prelude::*,
    std::collections::HashMap,
    std::str::Utf8Error,
    std::sync::Mutex,
    tree_sitter::{Language, LanguageError, Parser, Query, QueryCursor, QueryError},
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SymbolKind {
    Function,
    Method,
    Class,
    Struct,
    Enum,
    Trait,
    Type,
    Interface,
    Call,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Location {
    pub path: String,
    pub line: usize,
    pub col: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Symbol {
    pub name: String,
    pub kind: SymbolKind,
    pub location: Location,
}

#[derive(Error, Debug)]
pub enum SymbolSearchError {
    #[cfg(feature = "symbol")]
    #[error("tree-sitter language error: {0}")]
    Language(#[from] LanguageError),
    #[cfg(feature = "symbol")]
    #[error("tree-sitter query error: {0}")]
    Query(#[from] QueryError),
    #[error("I/O error reading file {0}: {1}")]
    Io(PathBuf, std::io::Error),
    #[cfg(feature = "symbol")]
    #[error("UTF-8 error processing file {0}: {1}")]
    Utf8(PathBuf, Utf8Error),
    #[cfg(feature = "symbol")]
    #[error("directory walk error: {0}")]
    Walk(#[from] WalkError),
    #[error("failed to parse file {0}")]
    Parse(PathBuf),
    #[error("symbol feature not enabled")]
    SymbolFeatureNotEnabled,
    #[error("Mutex was poisoned during parallel search")]
    MutexPoisoned,
}

#[cfg(feature = "symbol")]
pub fn get_language(path: &Path) -> Option<Language> {
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or_default();
    match ext {
        "rs" => Some(unsafe { tree_sitter_rust() }),
        "js" | "mjs" => Some(unsafe { tree_sitter_javascript() }),
        "ts" | "mts" => Some(unsafe { tree_sitter_typescript::language_typescript() }),
        "tsx" => Some(unsafe { tree_sitter_typescript::language_tsx() }),
        "py" => Some(unsafe { tree_sitter_python() }),
        "go" => Some(unsafe { tree_sitter_go() }),
        "json" => Some(unsafe { tree_sitter_json() }),
        _ => None,
    }
}

#[cfg(feature = "symbol")]
extern "C" {
    fn tree_sitter_rust() -> Language;
    fn tree_sitter_javascript() -> Language;
    fn tree_sitter_typescript() -> Language;
    fn tree_sitter_tsx() -> Language;
    fn tree_sitter_python() -> Language;
    fn tree_sitter_go() -> Language;
    fn tree_sitter_json() -> Language;
}

#[cfg(feature = "symbol")]
fn get_queries(lang: Language) -> Vec<(Query, SymbolKind)> {
    let queries = [
        ("(function_item name: (identifier) @name)", SymbolKind::Function),
        ("(struct_item name: (type_identifier) @name)", SymbolKind::Struct),
        ("(function_declaration name: (identifier) @name)", SymbolKind::Function),
        ("(class_declaration name: (identifier) @name)", SymbolKind::Class),
        ("(call_expression function: [(identifier) @name (field_expression) @name])", SymbolKind::Call),
        ("(call_expression function: [(identifier) @name (member_expression) @name])", SymbolKind::Call),
    ];

    queries
        .iter()
        .filter_map(|(q_str, kind)| {
            Query::new(lang, q_str).ok().map(|q| (q, kind.clone()))
        })
        .collect()
}

#[cfg(feature = "symbol")]
pub fn extract_symbols(path: &Path) -> Result<Vec<Symbol>, SymbolSearchError> {
    let Some(language) = get_language(path) else {
        return Ok(Vec::new());
    };

    let code = std::fs::read_to_string(path).map_err(|e| SymbolSearchError::Io(path.to_path_buf(), e))?;
    let mut parser = Parser::new();
    parser.set_language(language)?;
    let tree = parser.parse(&code, None).ok_or_else(|| SymbolSearchError::Parse(path.to_path_buf()))?;

    let mut symbols = Vec::new();
    let queries = get_queries(language);

    for (query, kind) in queries {
        let mut cursor = QueryCursor::new();
        for m in cursor.matches(&query, tree.root_node(), code.as_bytes()) {
            for capture in m.captures {
                let node = capture.node;
                let name = node.utf8_text(code.as_bytes())
                    .map_err(|e| SymbolSearchError::Utf8(path.to_path_buf(), e))?;
                let start_pos = node.start_position();
                symbols.push(Symbol {
                    name: name.to_string(),
                    kind: kind.clone(),
                    location: Location {
                        path: path.to_string_lossy().into_owned(),
                        line: start_pos.row + 1,
                        col: start_pos.column + 1,
                    },
                });
            }
        }
    }

    Ok(symbols)
}

#[cfg(feature = "symbol")]
pub fn search(root: &str, query: &str, limit: usize) -> Result<Vec<Symbol>, SymbolSearchError> {
    let results = Mutex::new(Vec::new());
    let error_store = Mutex::new(None::<SymbolSearchError>);
    let query_str = query.to_string();

    let walker = WalkParallel::new(root);
    walker.run(|| {
        Box::new(|entry| {
            if let Ok(guard) = error_store.lock() {
                if guard.is_some() {
                    return WalkState::Quit;
                }
            } else {
                return WalkState::Quit; // Stop if mutex is poisoned
            }

            let set_error = |e: SymbolSearchError| -> WalkState {
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
            match extract_symbols(path) {
                Ok(symbols) => {
                    let local_matches: Vec<Symbol> = symbols
                        .into_par_iter()
                        .filter(|sym| sym.name.contains(&query_str))
                        .collect();

                    if !local_matches.is_empty() {
                        if let Ok(mut results_guard) = results.lock() {
                            results_guard.extend(local_matches);
                            if results_guard.len() >= limit {
                                return WalkState::Quit;
                            }
                        } else {
                            return set_error(SymbolSearchError::MutexPoisoned);
                        }
                    }
                }
                Err(_) => {
                    // Continue even if one file fails to parse
                }
            }

            WalkState::Continue
        })
    });

    if let Some(err) = error_store.into_inner().map_err(|_| SymbolSearchError::MutexPoisoned)? {
        return Err(err);
    }

    let mut final_results = results.into_inner().map_err(|_| SymbolSearchError::MutexPoisoned)?;
    final_results.truncate(limit);
    Ok(final_results)
}

#[cfg(not(feature = "symbol"))]
pub fn search(_root: &str, _query: &str, _limit: usize) -> Result<Vec<Symbol>, SymbolSearchError> {
    Err(SymbolSearchError::SymbolFeatureNotEnabled)
}

