use serde::{Deserialize, Serialize};
use git_search::{SearchQuery, SearchResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitSearchState {
    pub query: String,
    pub results: Vec<SearchResult>,
    pub searching: bool,
    pub selected_result: Option<usize>,
    pub show_preview: bool,
    pub max_results: usize,
    pub case_sensitive: bool,
    pub whole_word: bool,
    pub regex: bool,
}

impl Default for GitSearchState {
    fn default() -> Self {
        Self {
            query: String::new(),
            results: Vec::new(),
            searching: false,
            selected_result: None,
            show_preview: true,
            max_results: 100,
            case_sensitive: false,
            whole_word: false,
            regex: false,
        }
    }
}
