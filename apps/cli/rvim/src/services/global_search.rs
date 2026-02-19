use anyhow::Result;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub file_path: PathBuf,
    pub line_number: u64,
    pub line: String,
}

pub struct GlobalSearchService;

impl GlobalSearchService {
    pub fn search(_path: &Path, _pattern: &str) -> Result<Vec<SearchResult>> {
        // Stub implementation - grep_searcher API has compatibility issues
        // Return empty results for now
        Ok(vec![])
    }
}
