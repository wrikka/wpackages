use std::collections::HashMap;

/// Calculate Levenshtein distance between two strings
pub fn levenshtein_distance(s1: &str, s2: &str) -> u32 {
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

/// Calculate Jaccard similarity between two sets of tokens
pub fn jaccard_similarity<T: std::hash::Hash + Eq>(
    set1: &std::collections::HashSet<T>,
    set2: &std::collections::HashSet<T>,
) -> f64 {
    if set1.is_empty() && set2.is_empty() {
        return 1.0;
    }

    let intersection = set1.intersection(set2).count();
    let union = set1.union(set2).count();

    if union == 0 {
        return 0.0;
    }

    intersection as f64 / union as f64
}

/// Calculate cosine similarity between two vectors
pub fn cosine_similarity(vec1: &[f64], vec2: &[f64]) -> f64 {
    if vec1.len() != vec2.len() {
        return 0.0;
    }

    let dot_product: f64 = vec1.iter().zip(vec2.iter()).map(|(a, b)| a * b).sum();
    let norm1: f64 = vec1.iter().map(|x| x * x).sum::<f64>().sqrt();
    let norm2: f64 = vec2.iter().map(|x| x * x).sum::<f64>().sqrt();

    if norm1 == 0.0 || norm2 == 0.0 {
        return 0.0;
    }

    dot_product / (norm1 * norm2)
}

/// Calculate TF-IDF score
pub fn tfidf_score(term_frequency: u32, document_count: usize, total_documents: usize) -> f64 {
    if total_documents == 0 {
        return 0.0;
    }

    let tf = term_frequency as f64;
    let idf = (total_documents as f64 / document_count as f64).ln();

    tf * idf
}

/// Generate n-grams from text
pub fn generate_ngrams(text: &str, n: usize) -> Vec<String> {
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

/// Generate Soundex code for phonetic matching
pub fn soundex(text: &str) -> String {
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

/// Calculate similarity score (0-1) based on edit distance
pub fn similarity_score(s1: &str, s2: &str) -> f64 {
    let distance = levenshtein_distance(s1, s2);
    let max_len = std::cmp::max(s1.len(), s2.len());

    if max_len == 0 {
        return 1.0;
    }

    1.0 - (distance as f64 / max_len as f64)
}

/// Normalize text for comparison
pub fn normalize_text(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Extract keywords from text using simple frequency analysis
pub fn extract_keywords(text: &str, min_length: usize, max_keywords: usize) -> Vec<String> {
    let words: Vec<String> = text
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .split_whitespace()
        .filter(|word| word.len() >= min_length)
        .map(|word| word.to_string())
        .collect();

    let mut word_counts = HashMap::new();
    for word in &words {
        *word_counts.entry(word.clone()).or_insert(0) += 1;
    }

    let mut keywords: Vec<_> = word_counts
        .into_iter()
        .filter(|(_, count)| *count > 1) // Only keep words that appear more than once
        .collect();

    keywords.sort_by(|a, b| b.1.cmp(&a.1)); // Sort by frequency

    keywords
        .into_iter()
        .take(max_keywords)
        .map(|(word, _)| word)
        .collect()
}

/// Calculate memory usage estimate
pub fn estimate_memory_usage<T>(items: &[T]) -> usize {
    std::mem::size_of::<T>() * items.len()
}

/// Format bytes to human readable format
pub fn format_bytes(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;

    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }

    if unit_index == 0 {
        format!("{} {}", bytes, UNITS[unit_index])
    } else {
        format!("{:.2} {}", size, UNITS[unit_index])
    }
}

/// Generate unique ID
pub fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    format!("doc_{}", timestamp)
}

/// Validate if string is valid UTF-8
pub fn is_valid_utf8(text: &str) -> bool {
    text.is_char_boundary(0)
}

/// Truncate text to specified length with ellipsis
pub fn truncate_text(text: &str, max_length: usize) -> String {
    if text.len() <= max_length {
        return text.to_string();
    }

    let mut truncated = text
        .chars()
        .take(max_length.saturating_sub(3))
        .collect::<String>();
    truncated.push_str("...");
    truncated
}

/// Calculate term frequency
pub fn term_frequency(term: &str, text: &str) -> u32 {
    let text_lower = text.to_lowercase();
    let term_lower = term.to_lowercase();

    text_lower
        .split_whitespace()
        .filter(|word| *word == term_lower)
        .count() as u32
}

/// Calculate document frequency
pub fn document_frequency(term: &str, documents: &[String]) -> u32 {
    let term_lower = term.to_lowercase();

    documents
        .iter()
        .filter(|doc| doc.to_lowercase().contains(&term_lower))
        .count() as u32
}

/// Generate hash from string
pub fn hash_string(text: &str) -> u64 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    text.hash(&mut hasher);
    hasher.finish()
}

/// Check if two strings are anagrams
pub fn are_anagrams(s1: &str, s2: &str) -> bool {
    let mut chars1: Vec<char> = s1
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphabetic())
        .collect();
    let mut chars2: Vec<char> = s2
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphabetic())
        .collect();

    chars1.sort();
    chars2.sort();

    chars1 == chars2
}

/// Calculate Hamming distance between two strings of equal length
pub fn hamming_distance(s1: &str, s2: &str) -> Option<u32> {
    if s1.len() != s2.len() {
        return None;
    }

    Some(s1.chars().zip(s2.chars()).filter(|(a, b)| a != b).count() as u32)
}

/// Generate random string of specified length
pub fn random_string(length: usize) -> String {
    use rand::Rng;

    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                             abcdefghijklmnopqrstuvwxyz\
                             0123456789";

    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_levenshtein_distance() {
        assert_eq!(levenshtein_distance("kitten", "sitting"), 3);
        assert_eq!(levenshtein_distance("", "hello"), 5);
        assert_eq!(levenshtein_distance("hello", "hello"), 0);
    }

    #[test]
    fn test_soundex() {
        assert_eq!(soundex("Robert"), "R163");
        assert_eq!(soundex("Rupert"), "R163");
        assert_eq!(soundex("Ashcraft"), "A226");
    }

    #[test]
    fn test_similarity_score() {
        assert_eq!(similarity_score("hello", "hello"), 1.0);
        assert_eq!(similarity_score("", ""), 1.0);
        assert!(similarity_score("hello", "hallo") > 0.5);
    }

    #[test]
    fn test_generate_ngrams() {
        let ngrams = generate_ngrams("hello", 2);
        assert_eq!(ngrams, vec!["he", "el", "ll", "lo"]);

        let ngrams = generate_ngrams("a", 2);
        assert!(ngrams.is_empty());
    }

    #[test]
    fn test_are_anagrams() {
        assert!(are_anagrams("listen", "silent"));
        assert!(!are_anagrams("hello", "world"));
    }

    #[test]
    fn test_hamming_distance() {
        assert_eq!(hamming_distance("karolin", "kathrin"), Some(3));
        assert_eq!(hamming_distance("1011101", "1001001"), Some(2));
        assert_eq!(hamming_distance("abc", "abcd"), None);
    }
}
