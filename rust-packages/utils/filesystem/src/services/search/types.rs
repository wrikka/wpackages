use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Search match
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchMatch {
    pub file_path: PathBuf,
    pub line_number: usize,
    pub line_content: String,
    pub match_start: usize,
    pub match_end: usize,
    pub match_text: String,
}

impl SearchMatch {
    pub fn new(
        file_path: PathBuf,
        line_number: usize,
        line_content: String,
        match_start: usize,
        match_end: usize,
        match_text: String,
    ) -> Self {
        Self {
            file_path,
            line_number,
            line_content,
            match_start,
            match_end,
            match_text,
        }
    }

    pub fn display_line(&self) -> String {
        format!("{}:{}", self.file_path.display(), self.line_number)
    }
}

/// Search options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchOptions {
    pub case_sensitive: bool,
    pub regex_mode: bool,
    pub whole_word: bool,
    pub include_hidden: bool,
    pub follow_symlinks: bool,
    pub max_results: Option<usize>,
    pub file_patterns: Vec<String>,
    pub exclude_patterns: Vec<String>,
}

impl SearchOptions {
    pub fn new() -> Self {
        Self {
            case_sensitive: false,
            regex_mode: false,
            whole_word: false,
            include_hidden: false,
            follow_symlinks: false,
            max_results: None,
            file_patterns: vec!["*".to_string()],
            exclude_patterns: Vec::new(),
        }
    }

    pub fn with_case_sensitive(mut self, case_sensitive: bool) -> Self {
        self.case_sensitive = case_sensitive;
        self
    }

    pub fn with_regex_mode(mut self, regex_mode: bool) -> Self {
        self.regex_mode = regex_mode;
        self
    }

    pub fn with_whole_word(mut self, whole_word: bool) -> Self {
        self.whole_word = whole_word;
        self
    }

    pub fn with_include_hidden(mut self, include_hidden: bool) -> Self {
        self.include_hidden = include_hidden;
        self
    }

    pub fn with_max_results(mut self, max_results: usize) -> Self {
        self.max_results = Some(max_results);
        self
    }

    pub fn with_file_patterns(mut self, patterns: Vec<String>) -> Self {
        self.file_patterns = patterns;
        self
    }

    pub fn with_exclude_patterns(mut self, patterns: Vec<String>) -> Self {
        self.exclude_patterns = patterns;
        self
    }
}

impl Default for SearchOptions {
    fn default() -> Self {
        Self::new()
    }
}

/// Replace options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplaceOptions {
    pub case_sensitive: bool,
    pub regex_mode: bool,
    pub whole_word: bool,
    pub preview_mode: bool,
    pub confirm_each: bool,
}

impl ReplaceOptions {
    pub fn new() -> Self {
        Self {
            case_sensitive: false,
            regex_mode: false,
            whole_word: false,
            preview_mode: false,
            confirm_each: false,
        }
    }

    pub fn with_case_sensitive(mut self, case_sensitive: bool) -> Self {
        self.case_sensitive = case_sensitive;
        self
    }

    pub fn with_regex_mode(mut self, regex_mode: bool) -> Self {
        self.regex_mode = regex_mode;
        self
    }

    pub fn with_whole_word(mut self, whole_word: bool) -> Self {
        self.whole_word = whole_word;
        self
    }

    pub fn with_preview_mode(mut self, preview_mode: bool) -> Self {
        self.preview_mode = preview_mode;
        self
    }

    pub fn with_confirm_each(mut self, confirm_each: bool) -> Self {
        self.confirm_each = confirm_each;
        self
    }
}

impl Default for ReplaceOptions {
    fn default() -> Self {
        Self::new()
    }
}

/// Search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub matches: Vec<SearchMatch>,
    pub total_files: usize,
    pub total_matches: usize,
    pub is_complete: bool,
}

impl SearchResult {
    pub fn new() -> Self {
        Self {
            matches: Vec::new(),
            total_files: 0,
            total_matches: 0,
            is_complete: true,
        }
    }

    pub fn add_match(&mut self, m: SearchMatch) {
        self.matches.push(m);
        self.total_matches += 1;
    }

    pub fn file_count(&self) -> usize {
        let mut files = std::collections::HashSet::new();
        for m in &self.matches {
            files.insert(&m.file_path);
        }
        files.len()
    }

    pub fn is_empty(&self) -> bool {
        self.matches.is_empty()
    }
}

impl Default for SearchResult {
    fn default() -> Self {
        Self::new()
    }
}

/// Replace result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplaceResult {
    pub replaced_count: usize,
    pub files_modified: usize,
    pub preview_changes: Vec<PreviewChange>,
}

impl ReplaceResult {
    pub fn new() -> Self {
        Self {
            replaced_count: 0,
            files_modified: 0,
            preview_changes: Vec::new(),
        }
    }

    pub fn add_replacement(&mut self) {
        self.replaced_count += 1;
    }

    pub fn add_file(&mut self) {
        self.files_modified += 1;
    }
}

impl Default for ReplaceResult {
    fn default() -> Self {
        Self::new()
    }
}

/// Preview change
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreviewChange {
    pub file_path: PathBuf,
    pub line_number: usize,
    pub original_line: String,
    pub modified_line: String,
}

impl PreviewChange {
    pub fn new(
        file_path: PathBuf,
        line_number: usize,
        original_line: String,
        modified_line: String,
    ) -> Self {
        Self {
            file_path,
            line_number,
            original_line,
            modified_line,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_match() {
        let m = SearchMatch::new(
            PathBuf::from("test.rs"),
            10,
            "let x = 1;".to_string(),
            4,
            5,
            "x".to_string(),
        );

        assert_eq!(m.line_number, 10);
        assert_eq!(m.match_text, "x");
    }

    #[test]
    fn test_search_options() {
        let options = SearchOptions::new()
            .with_case_sensitive(true)
            .with_regex_mode(true)
            .with_max_results(100);

        assert!(options.case_sensitive);
        assert!(options.regex_mode);
        assert_eq!(options.max_results, Some(100));
    }

    #[test]
    fn test_search_result() {
        let mut result = SearchResult::new();
        assert!(result.is_empty());

        let m = SearchMatch::new(
            PathBuf::from("test.rs"),
            10,
            "let x = 1;".to_string(),
            4,
            5,
            "x".to_string(),
        );

        result.add_match(m);
        assert!(!result.is_empty());
        assert_eq!(result.total_matches, 1);
    }
}
