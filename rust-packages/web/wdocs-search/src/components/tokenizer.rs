use rust_stemmers::{Algorithm, Stemmer};
use std::borrow::Cow;
use std::collections::HashSet;

pub struct Tokenizer {
    stemmer: Stemmer,
    stop_words: HashSet<String>,
}

impl Default for Tokenizer {
    fn default() -> Self {
        Self::new()
    }
}

impl Tokenizer {
    pub fn new() -> Self {
        let stop_words = Self::default_stop_words();
        Self {
            stemmer: Stemmer::create(Algorithm::English),
            stop_words,
        }
    }

    /// Tokenizes a given text into a sequence of normalized terms.
    ///
    /// The process involves:
    /// 1. Splitting the text by whitespace.
    /// 2. Trimming non-alphanumeric characters from the start and end of each token.
    /// 3. Converting tokens to lowercase.
    /// 4. Filtering out stop words.
    /// 5. Applying stemming to each token.
    /// 6. Filtering out any empty tokens that result from this process.
    pub fn tokenize<'a>(&self, text: &'a str) -> impl Iterator<Item = Cow<'a, str>> + 'a {
        text.split_whitespace()
            .filter_map(Self::normalize_token)
            .filter(move |token| !self.stop_words.contains(token.as_ref()))
            .map(move |token| self.stemmer.stem(token))
    }

    /// Normalizes a single token by trimming, lowercasing, and checking for emptiness.
    fn normalize_token<'a>(token: &'a str) -> Option<Cow<'a, str>> {
        let trimmed = token.trim_matches(|c: char| !c.is_alphanumeric());
        if trimmed.is_empty() {
            return None;
        }

        if trimmed.chars().any(|c| c.is_uppercase()) {
            Some(Cow::Owned(trimmed.to_lowercase()))
        } else {
            Some(Cow::Borrowed(trimmed))
        }
    }

    fn default_stop_words() -> HashSet<String> {
        [
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into",
            "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then",
            "there", "these", "they", "this", "to", "was", "will", "with",
        ]
        .iter()
        .map(|&s| s.to_string())
        .collect()
    }
}
