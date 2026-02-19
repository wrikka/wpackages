use anyhow::Result;
use std::collections::HashMap;
use std::path::PathBuf;

/// Advanced search capabilities for code exploration
pub struct AdvancedSearchEngine {
    index: HashMap<String, Vec<SearchResult>>,
    symbol_index: HashMap<String, Vec<SymbolLocation>>,
}

impl AdvancedSearchEngine {
    /// Creates a new advanced search engine
    pub fn new() -> Self {
        Self {
            index: HashMap::new(),
            symbol_index: HashMap::new(),
        }
    }

    /// Indexes source code for searching
    pub fn index_source(&mut self, file_path: &PathBuf, source: &str) -> Result<()> {
        let lines: Vec<&str> = source.lines().collect();

        for (line_num, line) in lines.iter().enumerate() {
            let words: Vec<&str> = line.split_whitespace().collect();

            for word in words {
                let word_lower = word.to_lowercase();
                self.index
                    .entry(word_lower)
                    .or_default()
                    .push(SearchResult {
                        file_path: file_path.clone(),
                        line: line_num + 1,
                        content: line.to_string(),
                    });
            }
        }

        Ok(())
    }

    /// Indexes symbols
    pub fn index_symbols(&mut self, symbols: Vec<SymbolLocation>) {
        for symbol in symbols {
            self.symbol_index
                .entry(symbol.name.clone())
                .or_default()
                .push(symbol);
        }
    }

    /// Performs fuzzy search
    pub fn fuzzy_search(&self, query: &str, limit: usize) -> Vec<SearchResult> {
        let query_lower = query.to_lowercase();
        let mut results = Vec::new();

        for (word, hits) in &self.index {
            let score = self.fuzzy_score(&query_lower, word);
            if score > 0.5 {
                for hit in hits {
                    results.push((hit.clone(), score));
                }
            }
        }

        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(limit);
        results.into_iter().map(|(r, _)| r).collect()
    }

    /// Performs semantic search
    pub fn semantic_search(&self, query: &str, limit: usize) -> Vec<SearchResult> {
        let query_lower = query.to_lowercase();
        let mut results = Vec::new();

        for (word, hits) in &self.index {
            if word.contains(&query_lower) || query_lower.contains(word) {
                for hit in hits {
                    results.push(hit.clone());
                }
            }
        }

        results.truncate(limit);
        results
    }

    /// Searches for symbols
    pub fn search_symbols(&self, query: &str, limit: usize) -> Vec<SymbolLocation> {
        let query_lower = query.to_lowercase();
        let mut results = Vec::new();

        for (name, locations) in &self.symbol_index {
            if name.to_lowercase().contains(&query_lower) {
                results.extend(locations.clone());
            }
        }

        results.truncate(limit);
        results
    }

    /// Gets references to a symbol
    pub fn get_symbol_references(&self, symbol_name: &str) -> Vec<SearchResult> {
        self.index.get(symbol_name).cloned().unwrap_or_default()
    }

    fn fuzzy_score(&self, query: &str, text: &str) -> f64 {
        if query == text {
            return 1.0;
        }

        if text.starts_with(query) {
            return 0.9;
        }

        if text.contains(query) {
            return 0.7;
        }

        // Calculate Levenshtein distance
        let distance = self.levenshtein_distance(query, text);
        let max_len = query.len().max(text.len());

        if max_len == 0 {
            return 0.0;
        }

        1.0 - (distance as f64 / max_len as f64)
    }

    fn levenshtein_distance(&self, s1: &str, s2: &str) -> usize {
        let chars1: Vec<char> = s1.chars().collect();
        let chars2: Vec<char> = s2.chars().collect();
        let len1 = chars1.len();
        let len2 = chars2.len();

        let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

        for i in 0..=len1 {
            matrix[i][0] = i;
        }

        for j in 0..=len2 {
            matrix[0][j] = j;
        }

        for i in 1..=len1 {
            for j in 1..=len2 {
                let cost = if chars1[i - 1] == chars2[j - 1] { 0 } else { 1 };
                matrix[i][j] = *[
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost,
                ]
                .iter()
                .min()
                .unwrap();
            }
        }

        matrix[len1][len2]
    }
}

impl Default for AdvancedSearchEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Search result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SearchResult {
    pub file_path: PathBuf,
    pub line: usize,
    pub content: String,
}

/// Symbol location
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SymbolLocation {
    pub name: String,
    pub kind: String,
    pub file_path: PathBuf,
    pub line: usize,
    pub column: usize,
}
