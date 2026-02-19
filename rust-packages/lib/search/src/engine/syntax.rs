use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use thiserror::Error;

#[cfg(feature = "syntax")]
use {
    ignore::{WalkParallel, WalkState},
    std::str::Utf8Error,
    std::sync::{Arc, Mutex},
    tree_sitter::{Language, LanguageError, Node, Parser, Query, QueryCursor, QueryError},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyntaxMatch {
    pub path: String,
    pub start_line: usize,
    pub end_line: usize,
    pub snippet: String,
    pub score: f64,
    pub captures: HashMap<String, String>,
}

#[derive(Error, Debug)]
pub enum SyntaxSearchError {
    #[cfg(feature = "syntax")]
    #[error("tree-sitter language error: {0}")]
    Language(#[from] LanguageError),
    #[cfg(feature = "syntax")]
    #[error("tree-sitter query error: {0}")]
    Query(#[from] QueryError),
    #[error("I/O error reading file {0}: {1}")]
    Io(PathBuf, std::io::Error),
    #[cfg(feature = "syntax")]
    #[error("UTF-8 error processing file {0}: {1}")]
    Utf8(PathBuf, Utf8Error),
    #[error("syntax feature not enabled")]
    SyntaxFeatureNotEnabled,
    #[error("Mutex was poisoned during parallel search")]
    MutexPoisoned,
}

#[cfg(feature = "syntax")]
fn calculate_score(node: Node) -> f64 {
    let mut score = 1.0;
    let mut current = Some(node);
    while let Some(n) = current {
        match n.kind() {
            "function_item" | "class_declaration" | "method_definition" => score *= 1.5,
            "if_statement" | "for_statement" | "while_statement" => score *= 1.1,
            _ => {}
        }
        current = n.parent();
    }
    score
}

#[cfg(feature = "syntax")]
pub fn search(
    root: &str,
    query_str: &str,
    language_str: Option<&str>,
    limit: usize,
) -> Result<Vec<SyntaxMatch>, SyntaxSearchError> {
    let results = Mutex::new(Vec::new());
    let error_store = Mutex::new(None::<SyntaxSearchError>);
    let query_cache: Mutex<HashMap<Language, Arc<Query>>> = Mutex::new(HashMap::new());

    let walker = WalkParallel::new(root);
    walker.run(|| {
        let mut parser = Parser::new();
        Box::new(|entry| {
            if error_store.lock().map(|g| g.is_some()).unwrap_or(true) {
                return WalkState::Quit;
            }

            let set_error = |e: SyntaxSearchError| -> WalkState {
                if let Ok(mut guard) = error_store.lock() {
                    if guard.is_none() {
                        *guard = Some(e);
                    }
                }
                WalkState::Quit
            };

            let entry = match entry {
                Ok(e) => e,
                Err(_) => return WalkState::Continue,
            };

            if !entry.file_type().map_or(false, |t| t.is_file()) {
                return WalkState::Continue;
            }

            let path = entry.path();

            let language = if let Some(lang_str) = language_str {
                super::symbol::get_language(std::path::Path::new(&format!("file.{}", lang_str)))
            } else {
                super::symbol::get_language(path)
            };

            let Some(language) = language else {
                return WalkState::Continue;
            };

            let query = {
                let mut query_guard = match query_cache.lock() {
                    Ok(q) => q,
                    Err(_) => return set_error(SyntaxSearchError::MutexPoisoned),
                };
                if let Some(q) = query_guard.get(&language) {
                    q.clone()
                } else {
                    match Query::new(language, query_str) {
                        Ok(q) => {
                            let arc_q = Arc::new(q);
                            query_guard.insert(language, arc_q.clone());
                            arc_q
                        }
                        Err(e) => return set_error(e.into()),
                    }
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

            let mut local_results = Vec::new();
            let mut cursor = QueryCursor::new();

            for m in cursor.matches(&query, tree.root_node(), code.as_bytes()) {
                let mut captures = HashMap::new();
                for capture in m.captures {
                    let capture_name = &query.capture_names()[capture.index as usize];
                    let text = match std::str::from_utf8(&code.as_bytes()[capture.node.byte_range()]) {
                        Ok(t) => t,
                        Err(e) => return set_error(SyntaxSearchError::Utf8(path.to_path_buf(), e)),
                    };
                    captures.insert(capture_name.clone(), text.to_string());
                }

                let main_node = m.captures[0].node;
                let start_line = main_node.start_position().row + 1;
                let end_line = main_node.end_position().row + 1;
                let snippet = match main_node.utf8_text(code.as_bytes()) {
                    Ok(s) => s.to_string(),
                    Err(e) => return set_error(SyntaxSearchError::Utf8(path.to_path_buf(), e)),
                };
                let score = calculate_score(main_node);

                local_results.push(SyntaxMatch {
                    path: path.display().to_string(),
                    start_line,
                    end_line,
                    snippet,
                    score,
                    captures,
                });
            }

            if !local_results.is_empty() {
                if let Ok(mut results_guard) = results.lock() {
                    results_guard.extend(local_results);
                    if results_guard.len() >= limit {
                        return WalkState::Quit;
                    }
                } else {
                    return set_error(SyntaxSearchError::MutexPoisoned);
                }
            }

            WalkState::Continue
        })
    });

    if let Some(err) = error_store.into_inner().map_err(|_| SyntaxSearchError::MutexPoisoned)? {
        return Err(err);
    }

    let mut final_results = results.into_inner().map_err(|_| SyntaxSearchError::MutexPoisoned)?;
    final_results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    final_results.truncate(limit);
    Ok(final_results)
}

#[cfg(not(feature = "syntax"))]
pub fn search(
    _root: &str,
    _query: &str,
    _language: Option<&str>,
    _limit: usize,
) -> Result<Vec<SyntaxMatch>, SyntaxSearchError> {
    Err(SyntaxSearchError::SyntaxFeatureNotEnabled)
}
