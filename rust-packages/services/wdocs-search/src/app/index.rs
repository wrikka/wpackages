use crate::app::utils;
use crate::app::{FuzzySearcher, PersistenceManager, SearchEngine, SuggestionEngine};
use crate::components::inverted_index::InvertedIndex;
use crate::components::tokenizer::Tokenizer;
use crate::types::document::{DocId, Document};
use crate::types::search_options::{IndexStats, SearchOptions, SearchResult};
use rustc_hash::FxHashMap;
use std::path::Path;

/// Main Index struct that coordinates all search functionality
pub struct Index {
    search_engine: SearchEngine,
    fuzzy_searcher: FuzzySearcher,
    suggestion_engine: SuggestionEngine,
    persistence_manager: PersistenceManager,
    staged_docs: Vec<Document>,
    next_doc_id: DocId,
    is_built: bool,
}

impl Default for Index {
    fn default() -> Self {
        Self::new()
    }
}

impl Index {
    /// Create a new Index instance
    pub fn new() -> Self {
        Self {
            search_engine: SearchEngine::new(),
            fuzzy_searcher: FuzzySearcher::new(),
            suggestion_engine: SuggestionEngine::new(),
            persistence_manager: PersistenceManager,
            staged_docs: Vec::new(),
            next_doc_id: 0,
            is_built: false,
        }
    }

    /// Add documents to index (staging phase)
    pub fn add_documents(&mut self, docs: Vec<Document>) -> Result<(), String> {
        if self.is_built {
            return Err("Index is already built. Cannot add more documents.".to_string());
        }

        for doc in docs {
            let mut doc_with_id = doc;
            doc_with_id.id = self.next_doc_id;
            self.next_doc_id += 1;
            self.staged_docs.push(doc_with_id);
        }

        Ok(())
    }

    /// Build index from staged documents
    pub fn build(&mut self) -> Result<(), String> {
        if self.staged_docs.is_empty() {
            return Err("No documents to build index from.".to_string());
        }

        // Add all staged documents to search engine
        for doc in &self.staged_docs {
            self.search_engine.add_document(doc.clone());
        }

        // Build inverted index
        self.search_engine.build_index();
        self.is_built = true;

        Ok(())
    }

    /// Search for documents with options
    pub fn search(&self, query: &str, options: Option<SearchOptions>) -> SearchResult {
        if !self.is_built {
            return SearchResult {
                documents: Vec::new(),
                scores: Vec::new(),
                total_hits: 0,
            };
        }

        let search_options = options.unwrap_or_default();
        let mut results = self.search_engine.search(query, &search_options);

        // Add fuzzy search results if enabled
        if search_options.fuzzy.unwrap_or(false) {
            let fuzzy_threshold = search_options.fuzzy_threshold.unwrap_or(2);
            let fuzzy_results = self.fuzzy_search(query, fuzzy_threshold);
            results.extend(fuzzy_results);
        }

        // Sort by score and apply pagination
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        let total_hits = results.len() as u32;
        let limit = search_options.limit.unwrap_or(10) as usize;
        let offset = search_options.offset.unwrap_or(0) as usize;

        let paginated_results = results.into_iter().skip(offset).take(limit);

        SearchResult {
            documents: paginated_results.clone().map(|(doc, _score)| doc).collect(),
            scores: paginated_results.map(|(_doc, score)| score).collect(),
            total_hits,
        }
    }

    /// Perform fuzzy search
    fn fuzzy_search(&self, query: &str, max_distance: u32) -> Vec<(Document, f64)> {
        let all_docs = self.search_engine.get_all_documents();
        let doc_texts: Vec<String> = all_docs
            .iter()
            .map(|doc| {
                let mut text = String::new();
                for (field, value) in &doc.fields {
                    text.push_str(value);
                    text.push(' ');
                }
                text.trim().to_string()
            })
            .collect();

        let mut fuzzy_results = Vec::new();

        for (i, doc) in all_docs.iter().enumerate() {
            let similarity = self.fuzzy_searcher.similarity_score(query, &doc_texts[i]);
            if similarity > 0.5 {
                // Threshold for fuzzy match
                fuzzy_results.push((doc.clone(), similarity));
            }
        }

        fuzzy_results
    }

    /// Get suggestions for autocomplete
    pub fn suggest(&self, query: &str, limit: u32) -> Vec<String> {
        if !self.is_built {
            return Vec::new();
        }

        // Get all terms from index (simplified approach)
        let all_docs = self.search_engine.get_all_documents();
        let mut all_terms = Vec::new();

        for doc in all_docs {
            for (field, value) in &doc.fields {
                let tokens = self.search_engine.tokenizer.tokenize(value);
                for token in tokens {
                    all_terms.push(token.into_owned());
                }
            }
        }

        // Remove duplicates
        all_terms.sort();
        all_terms.dedup();

        // Generate suggestions
        let suggestions = self.suggestion_engine.suggest_prefix(
            query,
            all_terms.iter().map(|s| s.as_str()),
            limit as usize,
        );

        suggestions
            .into_iter()
            .take(limit as usize)
            .map(|(term, _)| term)
            .collect()
    }

    /// Add a single document (for real-time updates)
    pub fn add_document(&mut self, mut doc: Document) -> Result<(), String> {
        if !self.is_built {
            return Err("Index must be built before adding individual documents.".to_string());
        }

        doc.id = self.next_doc_id;
        self.next_doc_id += 1;

        self.search_engine.add_document(doc.clone());
        self.search_engine.build_index(); // Rebuild index

        Ok(())
    }

    /// Update an existing document
    pub fn update_document(&mut self, doc_id: DocId, new_doc: Document) -> Result<(), String> {
        if !self.is_built {
            return Err("Index must be built before updating documents.".to_string());
        }

        // Remove old document and add new one
        self.remove_document(doc_id)?;
        let mut updated_doc = new_doc;
        updated_doc.id = doc_id;
        self.search_engine.add_document(updated_doc);
        self.search_engine.build_index(); // Rebuild index

        Ok(())
    }

    /// Remove a document
    pub fn remove_document(&mut self, _doc_id: DocId) -> Result<(), String> {
        if !self.is_built {
            return Err("Index must be built before removing documents.".to_string());
        }

        // Note: This is a simplified implementation
        // In practice, you'd need to rebuild the index without the removed document
        self.search_engine.build_index(); // Rebuild index

        Ok(())
    }

    /// Get index statistics
    pub fn get_stats(&self) -> IndexStats {
        let document_count = self.search_engine.len() as u32;
        let term_count = self.search_engine.len() * 10; // Rough estimate
        let memory_usage_bytes = utils::estimate_memory_usage(&[self.search_engine.len()]) as u64;

        IndexStats {
            document_count,
            term_count,
            memory_usage_bytes,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            updated_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }

    /// Save index to file
    pub fn save_to_file(&self, file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
        if !self.is_built {
            return Err("Index must be built before saving.".into());
        }

        // Get documents from search engine
        let docs = self.search_engine.get_all_documents();
        let mut docs_map = FxHashMap::default();

        for doc in docs {
            docs_map.insert(doc.id, doc.clone());
        }

        self.persistence_manager.save_index(
            &docs_map,
            self.next_doc_id,
            &self.search_engine.inverted_index,
            file_path,
        )?;

        Ok(())
    }

    /// Load index from file
    pub fn load_from_file(&mut self, file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
        let (docs, next_doc_id, _) = self.persistence_manager.load_index(file_path)?;

        // Clear current state
        self.search_engine = SearchEngine::new();
        self.staged_docs.clear();

        // Load documents
        for (doc_id, doc) in docs {
            self.search_engine.add_document(doc);
        }

        self.next_doc_id = next_doc_id;
        self.is_built = true;

        Ok(())
    }

    /// Get a specific document by ID
    pub fn get_document(&self, doc_id: DocId) -> Option<&Document> {
        self.search_engine.get_document(doc_id)
    }

    /// Get all documents
    pub fn get_all_documents(&self) -> Vec<&Document> {
        self.search_engine.get_all_documents()
    }

    /// Check if index is empty
    pub fn is_empty(&self) -> bool {
        self.search_engine.is_empty()
    }

    /// Get number of documents
    pub fn len(&self) -> usize {
        self.search_engine.len()
    }

    /// Check if index is built
    pub fn is_built(&self) -> bool {
        self.is_built
    }

    /// Clear index
    pub fn clear(&mut self) {
        self.search_engine = SearchEngine::new();
        self.staged_docs.clear();
        self.next_doc_id = 0;
        self.is_built = false;
    }

    /// Estimate memory usage
    pub fn estimate_memory_usage(&self) -> u64 {
        let docs_size = utils::estimate_memory_usage(&[self.search_engine.len()]);
        let staged_size = utils::estimate_memory_usage(&[self.staged_docs.len()]);

        (docs_size + staged_size) as u64
    }

    /// Create a backup of the index
    pub fn create_backup(&self, backup_dir: &Path) -> Result<String, Box<dyn std::error::Error>> {
        if !self.is_built {
            return Err("Index must be built before creating backup.".into());
        }

        // Get documents from search engine
        let docs = self.search_engine.get_all_documents();
        let mut docs_map = FxHashMap::default();

        for doc in docs {
            docs_map.insert(doc.id, doc.clone());
        }

        self.persistence_manager.create_backup(
            &docs_map,
            self.next_doc_id,
            &self.search_engine.inverted_index,
            backup_dir,
        )
    }

    /// Restore from backup
    pub fn restore_from_backup(
        &mut self,
        backup_file: &Path,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.load_from_file(backup_file)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn create_test_document(title: &str, content: &str) -> Document {
        let mut fields = std::collections::HashMap::new();
        fields.insert("title".to_string(), title.to_string());
        fields.insert("content".to_string(), content.to_string());

        Document {
            id: 0,
            fields,
            metadata: json!({"test": true}),
        }
    }

    #[test]
    fn test_index_creation() {
        let index = Index::new();
        assert!(!index.is_built());
        assert!(index.is_empty());
        assert_eq!(index.len(), 0);
    }

    #[test]
    fn test_add_and_build_documents() {
        let mut index = Index::new();

        let docs = vec![
            create_test_document("Hello World", "This is a test document"),
            create_test_document("Rust Programming", "Rust is a systems programming language"),
        ];

        assert!(index.add_documents(docs).is_ok());
        assert!(index.build().is_ok());
        assert!(index.is_built());
        assert_eq!(index.len(), 2);
    }

    #[test]
    fn test_search() {
        let mut index = Index::new();

        let docs = vec![
            create_test_document("Hello World", "This is a test document"),
            create_test_document("Rust Programming", "Rust is a systems programming language"),
        ];

        index.add_documents(docs).unwrap();
        index.build().unwrap();

        let results = index.search("test", None);
        assert_eq!(results.total_hits, 1);
        assert_eq!(results.documents[0].fields["title"], "Hello World");
    }

    #[test]
    fn test_suggestions() {
        let mut index = Index::new();

        let docs = vec![
            create_test_document("Hello World", "This is a test document"),
            create_test_document("Help Me", "This is another document"),
        ];

        index.add_documents(docs).unwrap();
        index.build().unwrap();

        let suggestions = index.suggest("hel", 10);
        assert!(!suggestions.is_empty());
        // Should contain terms starting with "hel"
    }

    #[test]
    fn test_fuzzy_search() {
        let mut index = Index::new();

        let docs = vec![create_test_document(
            "Hello World",
            "This is a test document",
        )];

        index.add_documents(docs).unwrap();
        index.build().unwrap();

        let mut options = SearchOptions::default();
        options.fuzzy = Some(true);
        options.fuzzy_threshold = Some(2);

        let results = index.search("helo", Some(options));
        assert!(!results.documents.is_empty());
    }
}
