use crate::types::document::DocId;
use fst::{Map, MapBuilder};
use roaring::RoaringBitmap;
use rustc_hash::FxHashMap;

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
    pub fn new() -> Self {
        Self {
            term_dictionary: Map::default(),
            postings_lists: Vec::new(),
        }
    }

    /// Retrieves the postings list for a given term.
    pub fn get_postings(&self, term: &str) -> Option<&RoaringBitmap> {
        self.term_dictionary
            .get(term)
            .map(|idx| &self.postings_lists[idx as usize])
    }

    pub fn from_builder(builder: InvertedIndexBuilder) -> Self {
        let mut postings_lists = Vec::with_capacity(builder.postings_map.len());
        let mut term_map_builder = MapBuilder::memory();

        let mut sorted_terms: Vec<_> = builder.postings_map.into_iter().collect();
        sorted_terms.sort_by(|a, b| a.0.cmp(&b.0));

        for (term, bitmap) in sorted_terms {
            let term_index = postings_lists.len() as u64;
            postings_lists.push(bitmap);
            term_map_builder.insert(term, term_index).unwrap();
        }

        let fst_bytes = term_map_builder.into_inner().unwrap();
        let term_dictionary = Map::new(fst_bytes).unwrap();

        Self {
            term_dictionary,
            postings_lists,
        }
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
