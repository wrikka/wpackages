use crate::components::tokenizer::Tokenizer;
use crate::types::document::{DocId, Document};
use std::collections::HashMap;

pub struct SuggestionEngine {
    tokenizer: Tokenizer,
}

impl Default for SuggestionEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl SuggestionEngine {
    pub fn new() -> Self {
        Self {
            tokenizer: Tokenizer::new(),
        }
    }

    /// Generate prefix-based suggestions
    pub fn suggest_prefix<'a>(
        &self,
        query: &str,
        terms: impl Iterator<Item = &'a str>,
        limit: usize,
    ) -> Vec<(&'a str, f64)> {
        let query_lower = query.to_lowercase();
        let mut suggestions = Vec::new();

        for term in terms {
            let term_lower = term.to_lowercase();

            // Exact prefix match
            if term_lower.starts_with(&query_lower) {
                let score = self.calculate_prefix_score(query, term);
                suggestions.push((term, score));
                continue;
            }

            // Check for fuzzy prefix matches
            if self.is_fuzzy_prefix_match(&query_lower, &term_lower) {
                let score = self.calculate_fuzzy_prefix_score(query, term);
                suggestions.push((term, score));
            }
        }

        // Sort by score (descending) and limit
        suggestions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        suggestions.into_iter().take(limit).collect()
    }

    /// Calculate score for exact prefix match
    fn calculate_prefix_score(&self, query: &str, term: &str) -> f64 {
        let query_len = query.len();
        let term_len = term.len();

        // Higher score for shorter terms (more specific)
        let length_score = 1.0 / (term_len as f64);

        // Higher score for exact length match
        let length_match_score = if query_len == term_len { 1.0 } else { 0.5 };

        // Higher score for common prefixes
        let common_prefix_bonus = self.get_common_prefix_bonus(query, term);

        length_score * length_match_score + common_prefix_bonus
    }

    /// Calculate score for fuzzy prefix match
    fn calculate_fuzzy_prefix_score(&self, query: &str, term: &str) -> f64 {
        let distance = self.levenshtein_distance(query, term);
        let max_len = std::cmp::max(query.len(), term.len());

        if max_len == 0 {
            return 0.0;
        }

        // Base similarity score
        let similarity = 1.0 - (distance as f64 / max_len as f64);

        // Penalty for fuzzy match
        let fuzzy_penalty = 0.5;

        similarity * fuzzy_penalty
    }

    /// Check if two strings have fuzzy prefix relationship
    fn is_fuzzy_prefix_match(&self, query: &str, term: &str) -> bool {
        if query.len() > term.len() {
            return false;
        }

        // Check if query is a fuzzy prefix of term
        let max_distance = std::cmp::max(1, term.len() / 4); // Allow 25% error rate
        self.levenshtein_distance(query, &term[..query.len()]) <= max_distance
    }

    /// Get bonus score for common prefixes
    fn get_common_prefix_bonus(&self, query: &str, term: &str) -> f64 {
        let common_prefixes = vec!["the", "a", "an", "in", "on", "re", "er", "ed"];

        for prefix in common_prefixes {
            if query.starts_with(prefix) && term.starts_with(prefix) {
                return 0.2; // Small bonus for common prefixes
            }
        }

        0.0
    }

    /// Generate suggestions based on edit distance
    pub fn suggest_edit_distance<'a>(
        &self,
        query: &str,
        terms: impl Iterator<Item = &'a str>,
        max_distance: u32,
        limit: usize,
    ) -> Vec<(&'a str, u32)> {
        let mut suggestions = Vec::new();

        for term in terms {
            let distance = self.levenshtein_distance(query, term);
            if distance <= max_distance {
                suggestions.push((term, distance));
            }
        }

        // Sort by distance (ascending) and limit
        suggestions.sort_by_key(|(_, distance)| *distance);
        suggestions.into_iter().take(limit).collect()
    }

    /// Generate phonetic suggestions
    pub fn suggest_phonetic<'a>(
        &self,
        query: &str,
        terms: impl Iterator<Item = &'a str>,
        limit: usize,
    ) -> Vec<(&'a str, f64)> {
        let query_soundex = self.soundex(query);
        let mut suggestions = Vec::new();

        for term in terms {
            let term_soundex = self.soundex(term);

            if query_soundex == term_soundex {
                // Calculate similarity score
                let score = self.similarity_score(query, term);
                suggestions.push((term, score));
            }
        }

        // Sort by score (descending) and limit
        suggestions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        suggestions.into_iter().take(limit).collect()
    }

    /// Calculate Levenshtein distance
    fn levenshtein_distance(&self, s1: &str, s2: &str) -> u32 {
        let chars1: Vec<char> = s1.chars().collect();
        let chars2: Vec<char> = s2.chars().collect();
        let len1 = chars1.len();
        let len2 = chars2.len();

        if len1 == 0 {
            return len2 as u32;
        }
        if len2 == 0 {
            return len1 as u32;
        }

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
                matrix[i][j] = std::cmp::min(
                    std::cmp::min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1),
                    matrix[i - 1][j - 1] + cost,
                );
            }
        }

        matrix[len1][len2] as u32
    }

    /// Calculate similarity score (0-1)
    fn similarity_score(&self, s1: &str, s2: &str) -> f64 {
        let distance = self.levenshtein_distance(s1, s2);
        let max_len = std::cmp::max(s1.len(), s2.len());

        if max_len == 0 {
            return 1.0;
        }

        1.0 - (distance as f64 / max_len as f64)
    }

    /// Generate Soundex code
    fn soundex(&self, text: &str) -> String {
        let mut code = String::with_capacity(4);
        let mut first_consonant = true;

        for (i, ch) in text.chars().enumerate() {
            if i == 0 && ch.is_ascii_alphabetic() {
                code.push(ch.to_ascii_uppercase());
                first_consonant = !matches!(
                    ch.to_ascii_uppercase(),
                    'A' | 'E' | 'I' | 'O' | 'U' | 'H' | 'W' | 'Y'
                );
                continue;
            }

            if ch.is_ascii_alphabetic() {
                let upper = ch.to_ascii_uppercase();
                match upper {
                    'B' | 'F' | 'P' | 'V' => code.push('1'),
                    'C' | 'G' | 'J' | 'K' | 'Q' | 'S' | 'X' | 'Z' => code.push('2'),
                    'D' | 'T' => code.push('3'),
                    'L' => code.push('4'),
                    'M' | 'N' => code.push('5'),
                    'R' => code.push('6'),
                    _ => {}
                }
            }
        }

        // Pad with zeros and keep first 4 characters
        while code.len() < 4 {
            code.push('0');
        }
        code.chars().take(4).collect()
    }

    /// Generate n-gram based suggestions
    pub fn suggest_ngrams<'a>(
        &self,
        query: &str,
        terms: impl Iterator<Item = &'a str>,
        n: usize,
        limit: usize,
    ) -> Vec<(&'a str, f64)> {
        let query_ngrams = self.generate_ngrams(query, n);
        let mut suggestions = Vec::new();

        for term in terms {
            let term_ngrams = self.generate_ngrams(term, n);

            // Calculate n-gram overlap score
            let mut common_ngrams = 0;
            for qgram in &query_ngrams {
                if term_ngrams.contains(qgram) {
                    common_ngrams += 1;
                }
            }

            if common_ngrams > 0 {
                let score = common_ngrams as f64 / query_ngrams.len() as f64;
                suggestions.push((term, score));
            }
        }

        // Sort by score (descending) and limit
        suggestions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        suggestions.into_iter().take(limit).collect()
    }

    /// Generate n-grams from text
    fn generate_ngrams(&self, text: &str, n: usize) -> Vec<String> {
        let chars: Vec<char> = text.chars().collect();
        let mut ngrams = Vec::new();

        if chars.len() < n {
            return ngrams;
        }

        for i in 0..=chars.len() - n {
            let ngram: String = chars[i..i + n].iter().collect();
            ngrams.push(ngram);
        }

        ngrams
    }
}
