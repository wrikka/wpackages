//! Pure similarity calculation components

use serde::{Deserialize, Serialize};

/// Similarity result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimilarityResult {
    pub score: f64,
    pub method: String,
    pub confidence: f64,
}

impl SimilarityResult {
    /// Create a new similarity result
    pub fn new(score: f64, method: String, confidence: f64) -> Self {
        Self {
            score,
            method,
            confidence,
        }
    }

    /// Validate the similarity result
    pub fn validate(&self) -> Result<(), String> {
        if self.score < 0.0 || self.score > 1.0 {
            return Err("Similarity score must be between 0.0 and 1.0".to_string());
        }

        if self.confidence < 0.0 || self.confidence > 1.0 {
            return Err("Confidence must be between 0.0 and 1.0".to_string());
        }

        if self.method.is_empty() {
            return Err("Method name cannot be empty".to_string());
        }

        Ok(())
    }
}

/// Trait for similarity calculations
pub trait SimilarityCalculator: Send + Sync {
    fn name(&self) -> &str;
    fn calculate(&self, text1: &str, text2: &str) -> SimilarityResult;
}

/// Jaccard similarity - pure function
#[derive(Debug, Clone)]
pub struct JaccardSimilarity;

impl SimilarityCalculator for JaccardSimilarity {
    fn name(&self) -> &str {
        "jaccard"
    }

    fn calculate(&self, text1: &str, text2: &str) -> SimilarityResult {
        let words1: std::collections::HashSet<&str> = text1.split_whitespace().collect();
        let words2: std::collections::HashSet<&str> = text2.split_whitespace().collect();

        let intersection = words1.intersection(&words2).count();
        let union = words1.union(&words2).count();

        let similarity = if union == 0 {
            1.0
        } else {
            intersection as f64 / union as f64
        };

        let confidence = if words1.is_empty() && words2.is_empty() {
            1.0
        } else {
            1.0 - (1.0 / (words1.len() + words2.len() + 1) as f64)
        };

        SimilarityResult::new(
            similarity,
            self.name().to_string(),
            confidence,
        )
    }
}

/// Levenshtein similarity - pure function
#[derive(Debug, Clone)]
pub struct LevenshteinSimilarity;

impl SimilarityCalculator for LevenshteinSimilarity {
    fn name(&self) -> &str {
        "levenshtein"
    }

    fn calculate(&self, text1: &str, text2: &str) -> SimilarityResult {
        let distance = levenshtein_distance(text1, text2);
        let max_len = text1.len().max(text2.len());
        
        let similarity = if max_len == 0 {
            1.0
        } else {
            1.0 - (distance as f64 / max_len as f64)
        };

        let confidence = 1.0 - (1.0 / (max_len + 1) as f64);

        SimilarityResult::new(
            similarity,
            self.name().to_string(),
            confidence,
        )
    }
}

/// Cosine similarity - pure function
#[derive(Debug, Clone)]
pub struct CosineSimilarity;

impl SimilarityCalculator for CosineSimilarity {
    fn name(&self) -> &str {
        "cosine"
    }

    fn calculate(&self, text1: &str, text2: &str) -> SimilarityResult {
        let tokens1 = tokenize(text1);
        let tokens2 = tokenize(text2);

        let vector1 = create_tf_vector(&tokens1);
        let vector2 = create_tf_vector(&tokens2);

        let similarity = cosine_similarity(&vector1, &vector2);
        
        let confidence = if tokens1.is_empty() && tokens2.is_empty() {
            1.0
        } else {
            1.0 - (1.0 / (tokens1.len() + tokens2.len() + 1) as f64)
        };

        SimilarityResult::new(
            similarity,
            self.name().to_string(),
            confidence,
        )
    }
}

/// Pure function to calculate Levenshtein distance
fn levenshtein_distance(s1: &str, s2: &str) -> usize {
    let chars1: Vec<char> = s1.chars().collect();
    let chars2: Vec<char> = s2.chars().collect();
    let len1 = chars1.len();
    let len2 = chars2.len();

    if len1 == 0 {
        return len2;
    }
    if len2 == 0 {
        return len1;
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
                std::cmp::min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1       // insertion
                ),
                matrix[i - 1][j - 1] + cost   // substitution
            );
        }
    }

    matrix[len1][len2]
}

/// Pure function to tokenize text
fn tokenize(text: &str) -> Vec<String> {
    text.to_lowercase()
        .split_whitespace()
        .map(|word| word.trim_matches(|c: char| !c.is_alphanumeric()).to_string())
        .filter(|word| !word.is_empty())
        .collect()
}

/// Pure function to create term frequency vector
fn create_tf_vector(tokens: &[String]) -> std::collections::HashMap<String, f64> {
    let mut tf = std::collections::HashMap::new();
    let total_tokens = tokens.len() as f64;

    for token in tokens {
        *tf.entry(token.clone()).or_insert(0.0) += 1.0 / total_tokens;
    }

    tf
}

/// Pure function to calculate cosine similarity
fn cosine_similarity(
    vec1: &std::collections::HashMap<String, f64>,
    vec2: &std::collections::HashMap<String, f64>,
) -> f64 {
    let mut dot_product = 0.0;
    let mut norm1 = 0.0;
    let mut norm2 = 0.0;

    for (term, &val1) in vec1 {
        dot_product += val1 * vec2.get(term).unwrap_or(&0.0);
        norm1 += val1 * val1;
    }

    for &val2 in vec2.values() {
        norm2 += val2 * val2;
    }

    let denominator = norm1.sqrt() * norm2.sqrt();
    
    if denominator == 0.0 {
        0.0
    } else {
        dot_product / denominator
    }
}

/// Utility function to create default similarity calculators
pub fn create_default_similarity_calculators() -> Vec<Box<dyn SimilarityCalculator>> {
    vec![
        Box::new(JaccardSimilarity),
        Box::new(LevenshteinSimilarity),
        Box::new(CosineSimilarity),
    ]
}

/// Utility function to calculate similarity with all methods
pub fn calculate_all_similarities(
    text1: &str,
    text2: &str,
    calculators: &[Box<dyn SimilarityCalculator>],
) -> Vec<SimilarityResult> {
    calculators
        .iter()
        .map(|calc| calc.calculate(text1, text2))
        .collect()
}
