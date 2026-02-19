use ignore::WalkParallel;
use rayon::prelude::*;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextMatch {
    pub path: String,
    pub line: usize,
    pub text: String,
}

#[derive(Error, Debug)]
pub enum TextSearchError {
    #[error("invalid regex: {0}")]
    InvalidRegex(#[from] regex::Error),
    #[error("I/O error reading file {0}: {1}")]
    Io(PathBuf, std::io::Error),
    #[error("Mutex was poisoned during parallel search")]
    MutexPoisoned,
}

pub fn search(
    root: &str,
    pattern: &str,
    is_regex: bool,
    limit: usize,
) -> Result<Vec<TextMatch>, TextSearchError> {
    let results = Mutex::new(Vec::new());

    let regex = if is_regex {
        Some(Regex::new(pattern).map_err(TextSearchError::InvalidRegex)?)
    } else {
        None
    };

    let walker = WalkParallel::new(root);
    walker.run(|| {
        Box::new(|entry| {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => return ignore::WalkState::Continue,
            };

            if !entry.file_type().is_some_and(|t| t.is_file()) {
                return ignore::WalkState::Continue;
            }

            let path = entry.path();
            let bytes = match fs::read(path) {
                Ok(b) => b,
                Err(_) => return ignore::WalkState::Continue, // Or handle error
            };

            let content = match std::str::from_utf8(&bytes) {
                Ok(s) => s,
                Err(_) => return ignore::WalkState::Continue, // Skip non-UTF8 files
            };

            let local_matches: Vec<TextMatch> = content
                .par_lines()
                .enumerate()
                .filter_map(|(idx, line)| {
                    let matched = if let Some(re) = &regex {
                        re.is_match(line)
                    } else {
                        line.contains(pattern)
                    };

                    if matched {
                        Some(TextMatch {
                            path: path.display().to_string(),
                            line: idx + 1,
                            text: line.to_string(),
                        })
                    } else {
                        None
                    }
                })
                .collect();

            if !local_matches.is_empty() {
                if let Ok(mut results_guard) = results.lock() {
                    results_guard.extend(local_matches);
                    if results_guard.len() >= limit {
                        return ignore::WalkState::Quit;
                    }
                } else {
                    return ignore::WalkState::Quit;
                }
            }

            ignore::WalkState::Continue
        })
    });

    let mut final_results = results.into_inner().map_err(|_| TextSearchError::MutexPoisoned)?;
    final_results.truncate(limit);
    Ok(final_results)
}
