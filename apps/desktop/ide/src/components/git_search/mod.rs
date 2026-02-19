//! # Git Search Component
//!
//! UI component for the Advanced Search & Navigation feature.

mod advanced_options;
mod results;
mod saved_queries;
mod search_input;

use crate::types::git_search_types::*;

/// Git search component
pub struct GitSearchComponent {
    pub query: String,
    pub search_type: SearchType,
    pub scope: SearchScope,
    pub results: Vec<SearchResult>,
    pub saved_queries: Vec<SavedQuery>,
    pub show_advanced: bool,
    pub selected_result: Option<usize>,
}

impl GitSearchComponent {
    /// Create a new git search component
    pub fn new() -> Self {
        Self {
            query: String::new(),
            search_type: SearchType::Text,
            scope: SearchScope::All,
            results: vec![],
            saved_queries: vec![],
            show_advanced: false,
            selected_result: None,
        }
    }

    /// Render the search component
    pub fn render(&mut self, ui: &mut egui::Ui) {
        ui.heading("Git Search");
        ui.separator();

        // Search input
        self.render_search_input(ui);
        ui.separator();

        // Advanced options
        if self.show_advanced {
            self.render_advanced_options(ui);
            ui.separator();
        }

        // Results
        if !self.results.is_empty() {
            self.render_results(ui);
        } else if !self.query.is_empty() {
            ui.label("No results found");
        }

        // Saved queries
        if !self.saved_queries.is_empty() {
            ui.separator();
            self.render_saved_queries(ui);
        }
    }

    /// Set search results
    pub fn set_results(&mut self, results: Vec<SearchResult>) {
        self.results = results;
    }

    /// Set saved queries
    pub fn set_saved_queries(&mut self, queries: Vec<SavedQuery>) {
        self.saved_queries = queries;
    }

    /// Get the current search query
    pub fn get_query(&self) -> SearchQuery {
        SearchQuery {
            query: self.query.clone(),
            search_type: self.search_type.clone(),
            scope: self.scope.clone(),
            filters: SearchFilters {
                author: None,
                time_range: None,
                file_pattern: None,
                branch: None,
                language: None,
            },
            limit: Some(100),
        }
    }
}

impl Default for GitSearchComponent {
    fn default() -> Self {
        Self::new()
    }
}
