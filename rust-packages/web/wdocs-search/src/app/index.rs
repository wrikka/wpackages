use crate::components::inverted_index::{InvertedIndex, InvertedIndexBuilder};
use crate::components::tokenizer::Tokenizer;
use crate::types::document::{DocId, Document};
use crate::types::search_options::{SearchOptions, SearchResult, IndexStats};
use dashmap::DashMap;
use rayon::prelude::*;
use roaring::RoaringBitmap;
use rustc_hash::FxHashMap;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};

pub struct Index {
    docs: FxHashMap<DocId, Document>,
    inverted_index: InvertedIndex,
    tokenizer: Tokenizer,
    staged_docs: Vec<Document>,
    next_doc_id: DocId,
    is_built: bool,
    // New fields for enhanced features
    field_weights: FxHashMap<String, f32>,
    token_positions: FxHashMap<String, FxHashMap<DocId, Vec<u32>>>,
}

impl Default for Index {
    fn default() -> Self {
        Self::new()
    }
}

impl Index {
    pub fn new() -> Self {
        Self {
            docs: FxHashMap::default(),
            inverted_index: InvertedIndex::new(),
            tokenizer: Tokenizer::new(),
            staged_docs: Vec::new(),
            next_doc_id: 0,
            is_built: false,
            field_weights: FxHashMap::default(),
            token_positions: FxHashMap::default(),
        }
    }

    pub fn add_documents(&mut self, docs: Vec<Document>) -> Result<(), String> {
        if self.is_built {
            return Err("Index is already built. Cannot add more documents.".to_string());
        }
        self.staged_docs.extend(docs);
        Ok(())
    }

    pub fn build(&mut self) {
        if self.is_built || self.staged_docs.is_empty() {
            return;
        }

        let docs_with_ids = self.assign_document_ids();
        let final_postings_map = self.build_postings_map_parallel(&docs_with_ids);

        let mut builder = InvertedIndexBuilder::new();
        builder.postings_map = final_postings_map;
        self.inverted_index = InvertedIndex::from_builder(builder);
        self.is_built = true;
    }

    fn assign_document_ids(&mut self) -> Vec<Document> {
        self.staged_docs
            .drain(..)
            .map(|mut doc| {
                let doc_id = self.next_doc_id;
                doc.id = doc_id;
                self.docs.insert(doc_id, doc.clone());
                self.next_doc_id += 1;
                doc
            })
            .collect()
    }

    fn build_postings_map_parallel(&self, docs: &[Document]) -> FxHashMap<String, RoaringBitmap> {
        let final_postings_map: DashMap<String, RoaringBitmap> = DashMap::new();

        docs.par_iter().for_each(|doc| {
            for value in doc.fields.values() {
                let tokens = self.tokenizer.tokenize(value);
                for token in tokens {
                    final_postings_map
                        .entry(token.into_owned())
                        .or_default()
                        .insert(doc.id as u32);
                }
            }
        });

        final_postings_map.into_iter().collect()
    }

    pub fn search_ids(&self, query: &str) -> RoaringBitmap {
        let query_tokens: Vec<_> = self.tokenizer.tokenize(query).collect();
        if query_tokens.is_empty() {
            return RoaringBitmap::new();
        }

        // 1. Collect all bitmaps for the query tokens from the inverted index.
        let mut bitmaps: Vec<&RoaringBitmap> = query_tokens
            .iter()
            .filter_map(|token| {
                self.inverted_index
                    .term_dictionary
                    .get(token.as_ref())
                    .map(|term_index| &self.inverted_index.postings_lists[term_index as usize])
            })
            .collect();

        // If any token is not found, the intersection will be empty.
        if bitmaps.len() != query_tokens.len() {
            return RoaringBitmap::new();
        }

        // 2. Sort bitmaps by size (cardinality) to intersect smallest first.
        bitmaps.sort_unstable_by_key(|b| b.len());

        // 3. Intersect all bitmaps.
        if let Some((first, rest)) = bitmaps.split_first() {
            rest.iter().fold((*first).clone(), |acc, &bm| acc & bm)
        } else {
            RoaringBitmap::new()
        }
    }

    pub fn search(&self, query: &str) -> Vec<Document> {
        self.search_ids(query)
            .iter()
            .take(10)
            .filter_map(|id| self.docs.get(&(id as u64)).cloned())
            .collect()
    }

    // Enhanced search methods
    pub fn update_document(&mut self, doc: Document) -> Result<(), String> {
        self.remove_document(doc.id)?;
        self.add_documents(vec![doc])?;
        self.build();
        Ok(())
    }

    pub fn remove_document(&mut self, doc_id: DocId) -> Result<(), String> {
        self.docs.remove(&doc_id);
        // Rebuild index to maintain consistency
        if self.is_built {
            self.rebuild_index();
        }
        Ok(())
    }

    fn rebuild_index(&mut self) {
        let docs: Vec<Document> = self.docs.values().cloned().collect();
        self.staged_docs = docs;
        self.is_built = false;
        self.build();
    }

    pub fn search_with_options(&self, query: &str, options: SearchOptions) -> SearchResult {
        let limit = options.limit.unwrap_or(10) as usize;
        let offset = options.offset.unwrap_or(0) as usize;
        let field_weights = options.field_weights.unwrap_or_default();
        
        let mut results = self.search_with_scoring(query, &field_weights);
        
        // Apply fuzzy search if enabled
        if options.fuzzy.unwrap_or(false) {
            let fuzzy_results = self.search_fuzzy(query, options.fuzzy_threshold.unwrap_or(2));
            results.extend(fuzzy_results);
        }
        
        // Sort by score and apply pagination
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        
        let total_hits = results.len() as u32;
        let paginated_results = results.into_iter().skip(offset).take(limit);
        
        SearchResult {
            documents: paginated_results.map(|(doc, _score)| doc).collect(),
            scores: paginated_results.map(|(_doc, score)| score).collect(),
            total_hits,
        }
    }

    fn search_with_scoring(&self, query: &str, field_weights: &FxHashMap<String, f32>) -> Vec<(Document, f32)> {
        let query_tokens: Vec<_> = self.tokenizer.tokenize(query).collect();
        if query_tokens.is_empty() {
            return Vec::new();
        }

        let mut results: Vec<(Document, f32)> = Vec::new();

        for (doc_id, doc) in &self.docs {
            let mut score = 0.0;
            
            for (field_name, field_value) in &doc.fields {
                let field_weight = field_weights.get(field_name).unwrap_or(&1.0);
                let field_tokens: Vec<_> = self.tokenizer.tokenize(field_value).collect();
                
                // Calculate TF-IDF-like score
                for query_token in &query_tokens {
                    if field_tokens.contains(query_token) {
                        let tf = field_tokens.iter().filter(|&&t| t == query_token).count() as f32;
                        score += tf * field_weight;
                    }
                }
            }
            
            if score > 0.0 {
                results.push((doc.clone(), score));
            }
        }

        results
    }

    pub fn search_fuzzy(&self, query: &str, max_distance: u32) -> Vec<Document> {
        let query_tokens: Vec<_> = self.tokenizer.tokenize(query).collect();
        let mut results: Vec<(Document, u32)> = Vec::new();

        for (doc_id, doc) in &self.docs {
            let mut total_distance = 0;
            let mut found_tokens = 0;

            for (field_name, field_value) in &doc.fields {
                let field_tokens: Vec<_> = self.tokenizer.tokenize(field_value).collect();
                
                for query_token in &query_tokens {
                    for field_token in &field_tokens {
                        let distance = levenshtein_distance(query_token, field_token);
                        if distance <= max_distance {
                            total_distance += distance;
                            found_tokens += 1;
                            break;
                        }
                    }
                }
            }

            if found_tokens > 0 {
                results.push((doc.clone(), total_distance));
            }
        }

        // Sort by distance (lower is better)
        results.sort_by_key(|(_, distance)| *distance);
        results.into_iter().take(10).map(|(doc, _)| doc).collect()
    }

    pub fn suggest(&self, query: &str, limit: u32) -> Vec<String> {
        let query_tokens: Vec<_> = self.tokenizer.tokenize(query).collect();
        let mut suggestions: Vec<(String, u32)> = Vec::new();

        for term in self.inverted_index.term_dictionary.keys() {
            for query_token in &query_tokens {
                if term.starts_with(query_token) {
                    let distance = levenshtein_distance(query_token, term);
                    if distance <= 2 {
                        suggestions.push((term.clone(), distance));
                    }
                }
            }
        }

        suggestions.sort_by_key(|(_, distance)| *distance);
        suggestions.into_iter().take(limit as usize).map(|(term, _)| term).collect()
    }

    pub fn get_stats(&self) -> IndexStats {
        let num_documents = self.docs.len() as u32;
        let num_tokens = self.inverted_index.term_dictionary.len() as u32;
        let memory_usage_bytes = self.estimate_memory_usage();

        IndexStats {
            num_documents,
            num_tokens,
            memory_usage_bytes,
        }
    }

    fn estimate_memory_usage(&self) -> u64 {
        // Rough estimation
        let docs_size = self.docs.len() * std::mem::size_of::<Document>();
        let index_size = self.inverted_index.term_dictionary.len() * std::mem::size_of::<String>();
        let postings_size = self.inverted_index.postings_lists.len() * std::mem::size_of::<RoaringBitmap>();
        
        (docs_size + index_size + postings_size) as u64
    }

    pub fn save_to_file(&self, path: &str) -> Result<(), String> {
        let serialized = serde_json::to_string(&self.docs)
            .map_err(|e| format!("Failed to serialize index: {}", e))?;
        
        fs::write(path, serialized)
            .map_err(|e| format!("Failed to write to file: {}", e))?;
        
        Ok(())
    }

    pub fn load_from_file(&mut self, path: &str) -> Result<(), String> {
        if !Path::new(path).exists() {
            return Err("File does not exist".to_string());
        }

        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        let docs: FxHashMap<DocId, Document> = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to deserialize index: {}", e))?;
        
        self.docs = docs;
        self.next_doc_id = self.docs.keys().max().unwrap_or(&0) + 1;
        self.rebuild_index();
        
        Ok(())
    }
}

// Simple Levenshtein distance implementation
fn levenshtein_distance(s1: &str, s2: &str) -> u32 {
    let chars1: Vec<char> = s1.chars().collect();
    let chars2: Vec<char> = s2.chars().collect();
    let len1 = chars1.len();
    let len2 = chars2.len();

    if len1 == 0 { return len2 as u32; }
    if len2 == 0 { return len1 as u32; }

    let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

    for i in 0..=len1 {
        matrix[i][0] = i;
    }
    for j in 0..=len2 {
        matrix[0][j] = j;
    }

    for i in 1..=len1 {
        for j in 1..=len2 {
            let cost = if chars1[i-1] == chars2[j-1] { 0 } else { 1 };
            matrix[i][j] = std::cmp::min(
                std::cmp::min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1
                ),
                matrix[i-1][j-1] + cost
            );
        }
    }

    matrix[len1][len2] as u32
}
