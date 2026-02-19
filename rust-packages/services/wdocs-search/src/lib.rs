#![deny(clippy::all)]
#![warn(missing_docs)]

#[macro_use]
extern crate napi_derive;

// Prelude for common imports
pub mod prelude;

// Core modules
pub mod app;
pub mod components;
pub mod config;
pub mod error;
pub mod types;

// Re-export main types for convenience
pub use error::{ConfigError, ConfigResult, SearchError, SearchResult as ErrorResult};
pub use prelude::*;

#[napi(object)]
#[derive(Debug, Clone)]
pub struct JsDocument {
    pub fields: FxHashMap<String, String>,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub documents: Vec<JsDocument>,
    pub scores: Vec<f64>,
    pub total_hits: u32,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct IndexStats {
    pub document_count: u32,
    pub term_count: u32,
    pub memory_usage_bytes: u64,
    pub created_at: u64,
    pub updated_at: u64,
}

#[napi]
pub struct NapiIndex {
    index: Index,
}

#[napi]
impl Default for NapiIndex {
    fn default() -> Self {
        Self::new()
    }
}

#[napi]
impl NapiIndex {
    #[napi(constructor)]
    pub fn new() -> Self {
        NapiIndex {
            index: Index::new(),
        }
    }

    #[napi]
    pub fn add_documents(&mut self, docs: Vec<JsDocument>) -> napi::Result<()> {
        let documents = docs
            .into_iter()
            .map(|doc| Document {
                id: 0,
                fields: doc.fields,
            })
            .collect();
        self.index
            .add_documents(documents)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))
    }

    #[napi]
    pub fn add_document(&mut self, doc: JsDocument) -> napi::Result<()> {
        self.add_documents(vec![doc])
    }

    #[napi]
    pub fn update_document(&mut self, doc_id: u32, doc: JsDocument) -> napi::Result<()> {
        let document = Document {
            id: doc_id as u64,
            fields: doc.fields,
        };
        self.index
            .update_document(document)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))
    }

    #[napi]
    pub fn remove_document(&mut self, doc_id: u32) -> napi::Result<()> {
        self.index
            .remove_document(doc_id as u64)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))
    }

    #[napi]
    pub fn build_index(&mut self) {
        self.index.build();
    }

    #[napi]
    pub fn search_ids(&self, query: String) -> napi::Result<Vec<u32>> {
        Ok(self.index.search_ids(&query).iter().collect())
    }

    #[napi]
    pub fn search(
        &self,
        query: String,
        options: Option<SearchOptions>,
    ) -> napi::Result<SearchResult> {
        let results = self.index.search(&query, options);
        Ok(SearchResult {
            documents: results
                .documents
                .into_iter()
                .map(|doc| JsDocument { fields: doc.fields })
                .collect(),
            scores: results.scores,
            total_hits: results.total_hits,
        })
    }

    #[napi]
    pub fn search_with_options(
        &self,
        query: String,
        options: Option<SearchOptions>,
    ) -> napi::Result<SearchResult> {
        let results = self.index.search(&query, options);
        Ok(SearchResult {
            documents: results
                .documents
                .into_iter()
                .map(|doc| JsDocument { fields: doc.fields })
                .collect(),
            scores: results.scores,
            total_hits: results.total_hits,
        })
    }

    #[napi]
    pub fn search_fuzzy(
        &self,
        query: String,
        max_distance: Option<u32>,
    ) -> napi::Result<Vec<JsDocument>> {
        let distance = max_distance.unwrap_or(2);
        let mut options = SearchOptions::default();
        options.fuzzy = Some(true);
        options.fuzzy_threshold = Some(distance);

        let results = self.index.search(&query, Some(options));
        Ok(results
            .documents
            .into_iter()
            .map(|doc| JsDocument { fields: doc.fields })
            .collect())
    }

    #[napi]
    pub fn suggest(&self, query: String, limit: Option<u32>) -> napi::Result<Vec<String>> {
        let suggestions = self.index.suggest(&query, limit.unwrap_or(5));
        Ok(suggestions)
    }

    #[napi]
    pub fn get_stats(&self) -> napi::Result<IndexStats> {
        let stats = self.index.get_stats();
        Ok(IndexStats {
            document_count: stats.document_count,
            term_count: stats.term_count,
            memory_usage_bytes: stats.memory_usage_bytes,
            created_at: stats.created_at,
            updated_at: stats.updated_at,
        })
    }

    #[napi]
    pub fn save_to_file(&self, path: String) -> napi::Result<()> {
        let path_buf = Path::new(&path);
        self.index
            .save_to_file(path_buf)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))
    }

    #[napi]
    pub fn load_from_file(&mut self, path: String) -> napi::Result<()> {
        let path_buf = Path::new(&path);
        self.index
            .load_from_file(path_buf)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))
    }
}
