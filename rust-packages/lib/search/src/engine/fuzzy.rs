use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;
use ignore::{WalkParallel, WalkState};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::BinaryHeap;
use std::cmp::Ordering;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct FuzzyMatch {
    pub path: String,
    pub line: usize,
    pub text: String,
    pub score: i64,
}

impl Ord for FuzzyMatch {
    fn cmp(&self, other: &Self) -> Ordering {
        other.score.cmp(&self.score) // Min-heap
    }
}

impl PartialOrd for FuzzyMatch {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(Error, Debug)]
pub enum FuzzySearchError {
    #[error("Mutex was poisoned during parallel search")]
    MutexPoisoned,
}

pub fn search(root: &str, pattern: &str, limit: usize) -> Result<Vec<FuzzyMatch>, FuzzySearchError> {
    let results = Mutex::new(BinaryHeap::with_capacity(limit));
    let pattern = pattern.to_string();

    let walker = WalkParallel::new(root);
    walker.run(|| {
        let matcher = SkimMatcherV2::default();
        let pattern = pattern.clone();
        Box::new(move |entry| {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => return WalkState::Continue,
            };

            if !entry.file_type().map_or(false, |t| t.is_file()) {
                return WalkState::Continue;
            }

            let path = entry.path();
            let content = match fs::read_to_string(path) {
                Ok(c) => c,
                Err(_) => return WalkState::Continue,
            };

            let local_matches: Vec<FuzzyMatch> = content
                .par_lines()
                .enumerate()
                .filter_map(|(idx, line)| {
                    matcher.fuzzy_match(line, &pattern).map(|score| FuzzyMatch {
                        path: path.display().to_string(),
                        line: idx + 1,
                        text: line.to_string(),
                        score,
                    })
                })
                .collect();

            if !local_matches.is_empty() {
                if let Ok(mut heap) = results.lock() {
                    for m in local_matches {
                        if heap.len() < limit {
                            heap.push(m);
                        } else if let Some(min) = heap.peek() {
                            if m.score > min.score {
                                heap.pop();
                                heap.push(m);
                            }
                        }
                    }
                } else {
                    return WalkState::Quit;
                }
            }

            WalkState::Continue
        })
    });

    let final_results = results.into_inner().map_err(|_| FuzzySearchError::MutexPoisoned)?;
    let sorted_results = final_results.into_sorted_vec();
    Ok(sorted_results)
}
