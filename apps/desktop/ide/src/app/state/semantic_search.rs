use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticSearchResult {
    pub file_path: String,
    pub line_number: usize,
    pub function_name: Option<String>,
    pub code_snippet: String,
    pub description: String,
    pub relevance: f32,
    pub context: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub language: Option<String>,
    pub file_pattern: Option<String>,
    pub max_results: usize,
}

#[derive(Debug, Clone, Default)]
pub struct SemanticSearchState {
    pub search_results: Vec<SemanticSearchResult>,
    pub search_history: Vec<SearchQuery>,
    pub current_query: Option<SearchQuery>,
    pub is_searching: bool,
    pub index_built: bool,
    pub cached_embeddings: HashMap<String, Vec<f32>>,
}

impl SemanticSearchState {
    pub fn new() -> Self {
        Self {
            search_results: Vec::new(),
            search_history: Vec::new(),
            current_query: None,
            is_searching: false,
            index_built: false,
            cached_embeddings: HashMap::new(),
        }
    }

    pub fn search(&mut self, query: SearchQuery) {
        self.current_query = Some(query.clone());
        self.is_searching = true;
        self.search_history.push(query);
    }

    pub fn add_result(&mut self, result: SemanticSearchResult) {
        self.search_results.push(result);
    }

    pub fn clear_results(&mut self) {
        self.search_results.clear();
    }

    pub fn build_index(&mut self) {
        self.index_built = true;
    }

    pub fn cache_embedding(&mut self, key: String, embedding: Vec<f32>) {
        self.cached_embeddings.insert(key, embedding);
    }

    pub fn get_embedding(&self, key: &str) -> Option<&Vec<f32>> {
        self.cached_embeddings.get(key)
    }
}
