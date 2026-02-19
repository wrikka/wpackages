use crate::components::tokenizer::Tokenizer;
use crate::types::document::{DocId, Document};
use std::collections::HashMap;

pub struct FuzzySearcher {
    tokenizer: Tokenizer,
}

impl Default for FuzzySearcher {
    fn default() -> Self {
        Self::new()
    }
}

impl FuzzySearcher {
    pub fn new() -> Self {
        Self {
            tokenizer: Tokenizer::new(),
        }
    }

    /// Calculate Levenshtein distance between two strings
    pub fn levenshtein_distance(&self, s1: &str, s2: &str) -> u32 {
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

    /// Find all terms within maximum edit distance
    pub fn find_fuzzy_matches<'a>(
        &self,
        query: &str,
        terms: impl Iterator<Item = &'a str>,
        max_distance: u32,
    ) -> Vec<(&'a str, u32)> {
        let query_tokens: Vec<_> = self.tokenizer.tokenize(query).collect();
        let mut matches = Vec::new();

        for term in terms {
            let term_tokens: Vec<_> = self.tokenizer.tokenize(term).collect();

            for query_token in &query_tokens {
                for term_token in &term_tokens {
                    let distance = self.levenshtein_distance(query_token, term_token);
                    if distance <= max_distance {
                        matches.push((term, distance));
                        break; // Found match for this query token
                    }
                }
            }
        }

        matches
    }

    /// Calculate similarity score (0-1) based on edit distance
    pub fn similarity_score(&self, s1: &str, s2: &str) -> f64 {
        let distance = self.levenshtein_distance(s1, s2);
        let max_len = std::cmp::max(s1.len(), s2.len());

        if max_len == 0 {
            return 1.0;
        }

        1.0 - (distance as f64 / max_len as f64)
    }

    /// Generate n-grams for better fuzzy matching
    pub fn generate_ngrams(&self, text: &str, n: usize) -> Vec<String> {
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

    /// Phonetic matching using Soundex algorithm
    pub fn soundex(&self, text: &str) -> String {
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

    /// Check if two strings have similar Soundex codes
    pub fn soundex_match(&self, s1: &str, s2: &str) -> bool {
        let code1 = self.soundex(s1);
        let code2 = self.soundex(s2);
        code1 == code2
    }
}
