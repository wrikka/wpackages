use crate::components::inverted_index::InvertedIndex;
use crate::components::tokenizer::Tokenizer;
use crate::types::document::{DocId, Document};
use crate::types::search_options::SearchOptions;
use dashmap::DashMap;
use rayon::prelude::*;
use roaring::RoaringBitmap;
use rustc_hash::FxHashMap;
use std::collections::HashMap;

pub struct SearchEngine {
    pub inverted_index: InvertedIndex,
    pub tokenizer: Tokenizer,
    docs: FxHashMap<DocId, Document>,
}

impl Default for SearchEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl SearchEngine {
    pub fn new() -> Self {
        Self {
            inverted_index: InvertedIndex::new(),
            tokenizer: Tokenizer::new(),
            docs: FxHashMap::default(),
        }
    }

    pub fn add_document(&mut self, doc: Document) {
        self.docs.insert(doc.id, doc);
    }

    pub fn build_index(&mut self) {
        let postings_map = self.build_postings_map_parallel();
        let mut builder = crate::components::inverted_index::InvertedIndexBuilder::new();
        builder.postings_map = postings_map;
        self.inverted_index = InvertedIndex::from_builder(builder);
    }

    fn build_postings_map_parallel(&self) -> FxHashMap<String, RoaringBitmap> {
        let final_postings_map: DashMap<String, RoaringBitmap> = DashMap::new();

        self.docs.par_iter().for_each(|(doc_id, doc)| {
            for value in doc.fields.values() {
                let tokens = self.tokenizer.tokenize(value);
                for token in tokens {
                    final_postings_map
                        .entry(token.into_owned())
                        .or_default()
                        .insert(*doc_id as u32);
                }
            }
        });

        final_postings_map.into_iter().collect()
    }

    pub fn search(&self, query: &str, options: &SearchOptions) -> Vec<(Document, f64)> {
        let query_tokens: Vec<_> = self.tokenizer.tokenize(query).collect();
        if query_tokens.is_empty() {
            return Vec::new();
        }

        let mut results: Vec<(Document, f64)> = Vec::new();

        for (_doc_id, doc) in &self.docs {
            let mut score = 0.0;

            for (field_name, field_value) in &doc.fields {
                let field_weight = options
                    .field_weights
                    .as_ref()
                    .and_then(|weights| weights.get(field_name))
                    .unwrap_or(&1.0);

                let field_tokens: Vec<_> = self.tokenizer.tokenize(field_value).collect();

                // Calculate TF-IDF-like score
                for query_token in &query_tokens {
                    if field_tokens.contains(&std::borrow::Cow::Borrowed(query_token)) {
                        let tf = field_tokens
                            .iter()
                            .filter(|&t| t == &std::borrow::Cow::Borrowed(query_token))
                            .count() as f64;
                        score += tf * field_weight;
                    }
                }
            }

            if score > 0.0 {
                results.push((doc.clone(), score));
            }
        }

        // Sort by score (descending)
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        let limit = options.limit.unwrap_or(10) as usize;
        let offset = options.offset.unwrap_or(0) as usize;

        results.into_iter().skip(offset).take(limit).collect()
    }

    pub fn get_document(&self, doc_id: DocId) -> Option<&Document> {
        self.docs.get(&doc_id)
    }

    pub fn get_all_documents(&self) -> Vec<&Document> {
        self.docs.values().collect()
    }

    pub fn len(&self) -> usize {
        self.docs.len()
    }

    pub fn is_empty(&self) -> bool {
        self.docs.is_empty()
    }
}
