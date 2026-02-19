use crate::search::error::{SearchError, SearchResult};
use crate::search::matcher::{Matcher, PlainMatcher, RegexMatcher};
use crate::search::replacer::Replacer;
use crate::search::types::{
    ReplaceOptions, ReplaceResult, SearchMatch, SearchOptions, SearchResult as SearchResults,
};
use async_trait::async_trait;
use ignore::WalkBuilder;
use std::path::Path;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::Semaphore;
use tracing::info;

/// Search client trait
#[async_trait]
pub trait SearchClient: Send + Sync {
    /// Search for a pattern in files
    async fn search(
        &self,
        pattern: &str,
        directory: &Path,
        options: SearchOptions,
    ) -> SearchResult<SearchResults>;

    /// Search in a single file
    async fn search_file(
        &self,
        pattern: &str,
        file_path: &Path,
        options: SearchOptions,
    ) -> SearchResult<SearchResults>;

    /// Replace pattern in files
    async fn replace(
        &self,
        pattern: &str,
        replacement: &str,
        directory: &Path,
        options: SearchOptions,
    ) -> SearchResult<ReplaceResult>;

    /// Replace pattern in a single file
    async fn replace_file(
        &self,
        pattern: &str,
        replacement: &str,
        file_path: &Path,
        options: SearchOptions,
    ) -> SearchResult<ReplaceResult>;
}

/// Search client implementation
pub struct SearchClientImpl {
    max_concurrent_files: usize,
}

impl SearchClientImpl {
    pub fn new() -> Self {
        Self {
            max_concurrent_files: 10,
        }
    }

    pub fn with_max_concurrent_files(mut self, max: usize) -> Self {
        self.max_concurrent_files = max;
        self
    }

    async fn search_in_file(
        &self,
        pattern: &str,
        file_path: &Path,
        options: &SearchOptions,
    ) -> SearchResult<Vec<SearchMatch>> {
        let content = fs::read_to_string(file_path).await?;

        let matcher: Box<dyn Matcher> = if options.regex_mode {
            Box::new(RegexMatcher::new(pattern)?)
        } else {
            Box::new(
                PlainMatcher::new(pattern)
                    .with_case_sensitive(options.case_sensitive)
                    .with_whole_word(options.whole_word),
            )
        };

        let mut matches = Vec::new();

        for (line_idx, line) in content.lines().enumerate() {
            let line_matches = matcher.find_all(line);

            for m in line_matches {
                matches.push(SearchMatch::new(
                    file_path.to_path_buf(),
                    line_idx + 1,
                    line.to_string(),
                    m.start,
                    m.end,
                    m.text,
                ));
            }
        }

        Ok(matches)
    }

    async fn replace_in_file(
        &self,
        pattern: &str,
        replacement: &str,
        file_path: &Path,
        options: &SearchOptions,
    ) -> SearchResult<ReplaceResult> {
        let content = fs::read_to_string(file_path).await?;

        let replacer = Replacer::new(pattern, replacement).with_options(ReplaceOptions {
            case_sensitive: options.case_sensitive,
            regex_mode: options.regex_mode,
            whole_word: options.whole_word,
            preview_mode: false,
            confirm_each: false,
        });

        let new_content = replacer.replace(&content)?;

        fs::write(file_path, new_content).await?;

        Ok(ReplaceResult {
            replaced_count: 1,
            files_modified: 1,
            preview_changes: Vec::new(),
        })
    }

    async fn search_in_file_static(
        pattern: &str,
        file_path: &Path,
        options: &SearchOptions,
    ) -> SearchResult<Vec<SearchMatch>> {
        let content = fs::read_to_string(file_path).await?;

        let matcher: Box<dyn Matcher> = if options.regex_mode {
            Box::new(RegexMatcher::new(pattern)?)
        } else {
            Box::new(
                PlainMatcher::new(pattern)
                    .with_case_sensitive(options.case_sensitive)
                    .with_whole_word(options.whole_word),
            )
        };

        let mut matches = Vec::new();

        for (line_idx, line) in content.lines().enumerate() {
            let line_matches = matcher.find_all(line);

            for m in line_matches {
                matches.push(SearchMatch::new(
                    file_path.to_path_buf(),
                    line_idx + 1,
                    line.to_string(),
                    m.start,
                    m.end,
                    m.text,
                ));
            }
        }

        Ok(matches)
    }
}

impl Default for SearchClientImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SearchClient for SearchClientImpl {
    async fn search(
        &self,
        pattern: &str,
        directory: &Path,
        options: SearchOptions,
    ) -> SearchResult<SearchResults> {
        info!("Searching for '{}' in {:?}", pattern, directory);

        let mut result = SearchResults::new();

        // Build walker
        let mut walker = WalkBuilder::new(directory);
        walker
            .hidden(!options.include_hidden)
            .follow_links(options.follow_symlinks);

        for pattern in &options.file_patterns {
            walker.add(pattern);
        }

        for pattern in options.exclude_patterns.clone() {
            let pattern = pattern.clone();
            walker
                .filter_entry(move |entry| !entry.file_name().to_string_lossy().contains(&pattern));
        }

        let walker = walker.build();

        // Use semaphore to limit concurrent file reads
        let semaphore = Arc::new(Semaphore::new(self.max_concurrent_files));
        let mut tasks = Vec::new();

        for entry in walker.flatten() {
            if entry.file_type().map(|ft| ft.is_file()).unwrap_or(false) {
                let path = entry.path().to_path_buf();
                let pattern = pattern.to_string();
                let options = options.clone();
                let semaphore = semaphore.clone();

                let task = tokio::spawn(async move {
                    let _permit = semaphore.acquire().await.unwrap();
                    Self::search_in_file_static(&pattern, &path, &options).await
                });

                tasks.push(task);
            }
        }

        // Collect results
        for task in tasks {
            if let Ok(Ok(matches)) = task.await {
                for m in matches {
                    result.add_match(m);

                    if let Some(max) = options.max_results {
                        if result.total_matches >= max {
                            result.is_complete = false;
                            return Ok(result);
                        }
                    }
                }
            }
        }

        result.total_files = result.file_count();

        info!(
            "Search complete: {} matches in {} files",
            result.total_matches, result.total_files
        );

        Ok(result)
    }

    async fn search_file(
        &self,
        pattern: &str,
        file_path: &Path,
        options: SearchOptions,
    ) -> SearchResult<SearchResults> {
        info!("Searching for '{}' in {:?}", pattern, file_path);

        let matches = self.search_in_file(pattern, file_path, &options).await?;

        let mut result = SearchResults::new();
        for m in matches {
            result.add_match(m);
        }

        result.total_files = if result.is_empty() { 0 } else { 1 };

        Ok(result)
    }

    async fn replace(
        &self,
        pattern: &str,
        replacement: &str,
        directory: &Path,
        options: SearchOptions,
    ) -> SearchResult<ReplaceResult> {
        info!(
            "Replacing '{}' with '{}' in {:?}",
            pattern, replacement, directory
        );

        // First, search to find files with matches
        let search_result = self.search(pattern, directory, options.clone()).await?;

        if search_result.is_empty() {
            return Err(SearchError::NoMatchesFound);
        }

        let mut total_result = ReplaceResult::new();

        // Replace in each file
        let semaphore = Arc::new(Semaphore::new(self.max_concurrent_files));
        let mut tasks = Vec::new();

        for m in &search_result.matches {
            let file_path = m.file_path.clone();
            let pattern = pattern.to_string();
            let replacement = replacement.to_string();
            let options = options.clone();
            let semaphore = semaphore.clone();
            let client = self.clone();

            let task = tokio::spawn(async move {
                let _permit = semaphore.acquire().await.unwrap();
                client
                    .replace_in_file(&pattern, &replacement, &file_path, &options)
                    .await
            });

            tasks.push(task);
        }

        for task in tasks {
            if let Ok(Ok(result)) = task.await {
                total_result.replaced_count += result.replaced_count;
                total_result.files_modified += result.files_modified;
            }
        }

        info!(
            "Replace complete: {} replacements in {} files",
            total_result.replaced_count, total_result.files_modified
        );

        Ok(total_result)
    }

    async fn replace_file(
        &self,
        pattern: &str,
        replacement: &str,
        file_path: &Path,
        options: SearchOptions,
    ) -> SearchResult<ReplaceResult> {
        info!(
            "Replacing '{}' with '{}' in {:?}",
            pattern, replacement, file_path
        );

        self.replace_in_file(pattern, replacement, file_path, &options)
            .await
    }
}

impl Clone for SearchClientImpl {
    fn clone(&self) -> Self {
        Self {
            max_concurrent_files: self.max_concurrent_files,
        }
    }
}

/// Create a new search client
pub fn create_search_client() -> SearchClientImpl {
    SearchClientImpl::new()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_search_client() {
        let temp_dir = TempDir::new().unwrap();
        let test_file = temp_dir.path().join("test.txt");
        fs::write(&test_file, "hello world\nhello rust\nhello test")
            .await
            .unwrap();

        let client = create_search_client();
        let options = SearchOptions::new();

        let result = client
            .search("hello", temp_dir.path(), options)
            .await
            .unwrap();

        assert_eq!(result.total_matches, 3);
    }

    #[tokio::test]
    async fn test_replace_client() {
        let temp_dir = TempDir::new().unwrap();
        let test_file = temp_dir.path().join("test.txt");
        fs::write(&test_file, "hello world\nhello rust\nhello test")
            .await
            .unwrap();

        let client = create_search_client();
        let options = SearchOptions::new();

        let result = client
            .replace("hello", "hi", temp_dir.path(), options)
            .await
            .unwrap();

        assert_eq!(result.replaced_count, 3);
        assert_eq!(result.files_modified, 1);

        let content = fs::read_to_string(&test_file).await.unwrap();
        assert!(content.contains("hi"));
        assert!(!content.contains("hello"));
    }
}
