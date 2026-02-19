use crate::types::document::DocId;
use fst::{Map, MapBuilder};
use roaring::RoaringBitmap;
use rustc_hash::FxHashMap;

/// Builder for creating InvertedIndex
#[derive(Debug, Default)]
pub struct InvertedIndexBuilder {
    pub postings_map: FxHashMap<String, RoaringBitmap>,
}

impl InvertedIndexBuilder {
    /// Create new builder
    pub fn new() -> Self {
        Self::default()
    }

    /// Add postings for a term
    pub fn add_term(&mut self, term: String, postings: RoaringBitmap) {
        self.postings_map.insert(term, postings);
    }

    /// Add multiple postings
    pub fn add_postings(&mut self, postings: FxHashMap<String, RoaringBitmap>) {
        self.postings_map.extend(postings);
    }

    /// Build the InvertedIndex
    pub fn build(self) -> InvertedIndex {
        let mut builder = MapBuilder::new();

        // Sort terms for consistent ordering
        let mut sorted_terms: Vec<_> = self.postings_map.keys().collect();
        sorted_terms.sort();

        for (i, term) in sorted_terms.iter().enumerate() {
            if let Some(postings) = self.postings_map.get(term) {
                builder.insert(term, i as u64).unwrap();
            }
        }

        let term_dictionary = builder.into_map();
        let postings_lists: Vec<RoaringBitmap> = sorted_terms
            .iter()
            .map(|term| self.postings_map.get(term).unwrap().clone())
            .collect();

        InvertedIndex {
            term_dictionary,
            postings_lists,
        }
    }
}

/// Pure inverted index implementation - no side effects
#[derive(Debug, Clone)]
pub struct InvertedIndex {
    pub term_dictionary: Map<Vec<u8>>,
    pub postings_lists: Vec<RoaringBitmap>,
}

impl Default for InvertedIndex {
    fn default() -> Self {
        Self::new()
    }
}

impl InvertedIndex {
    /// Create new empty inverted index
    pub fn new() -> Self {
        Self {
            term_dictionary: Map::default(),
            postings_lists: Vec::new(),
        }
    }

    /// Create from builder
    pub fn from_builder(builder: InvertedIndexBuilder) -> Self {
        builder.build()
    }

    /// Get postings for a term (pure function)
    pub fn get_postings(&self, term: &str) -> Option<&RoaringBitmap> {
        self.term_dictionary
            .get(term)
            .map(|idx| &self.postings_lists[idx as usize])
    }

    /// Check if term exists in index
    pub fn contains_term(&self, term: &str) -> bool {
        self.term_dictionary.contains(term)
    }

    /// Get number of terms in index
    pub fn term_count(&self) -> usize {
        self.term_dictionary.len()
    }

    /// Get all terms in index
    pub fn get_all_terms(&self) -> Vec<String> {
        self.term_dictionary
            .stream()
            .into_iter()
            .map(|(term, _)| term.to_string())
            .collect()
    }

    /// Merge another inverted index into this one
    pub fn merge(&mut self, other: &InvertedIndex) {
        let mut builder = InvertedIndexBuilder::new();

        // Add current postings
        for term in self.get_all_terms() {
            if let Some(postings) = self.get_postings(&term) {
                builder.add_term(term, postings.clone());
            }
        }

        // Add other postings
        for term in other.get_all_terms() {
            if let Some(postings) = other.get_postings(&term) {
                builder.add_term(term, postings);
            }
        }

        // Rebuild index
        *self = builder.build();
    }

    /// Calculate memory usage estimate
    pub fn estimate_memory_usage(&self) -> usize {
        let dict_size = std::mem::size_of::<Map<Vec<u8>>>()
            + self.term_dictionary.len() * std::mem::size_of::<Vec<u8>>();
        let postings_size = self.postings_lists.len() * std::mem::size_of::<RoaringBitmap>();

        dict_size + postings_size
    }
}

/// A builder for creating an `InvertedIndex`.
///
/// This builder collects term-document mappings and then constructs
/// an efficient, immutable `InvertedIndex` from them.
#[derive(Default)]
pub struct InvertedIndexBuilder {
    pub postings_map: FxHashMap<String, RoaringBitmap>,
}

impl InvertedIndexBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_document(&mut self, doc_id: DocId, tokens: impl Iterator<Item = String>) {
        for token in tokens {
            self.postings_map
                .entry(token)
                .or_default()
                .insert(doc_id as u32);
        }
    }
}
