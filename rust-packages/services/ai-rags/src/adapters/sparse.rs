use crate::error::RagResult;
use crate::types::TextChunk;
use async_trait::async_trait;
use rust_stop_words::{get_stop_words, StopWords};
use whatlang::{detect, Lang}; 
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[async_trait]
pub trait SparseRetriever: Send + Sync {
    async fn add(&self, chunk: &TextChunk) -> RagResult<()>;

    async fn add_batch(&self, chunks: &[TextChunk]) -> RagResult<()> {
        for chunk in chunks {
            self.add(chunk).await?;
        }
        Ok(())
    }

    async fn search(&self, query: &str, top_k: usize) -> RagResult<Vec<(TextChunk, f32)>>;

    async fn delete(&self, chunk_id: &str) -> RagResult<()>;
}

#[derive(Default)]
struct Bm25State {
    chunks: HashMap<String, TextChunk>,
    chunk_len: HashMap<String, usize>,
    term_freqs: HashMap<String, HashMap<String, u32>>,
    doc_freq: HashMap<String, u32>,
    doc_count: u32,
    total_len: u64,
}

pub struct InMemoryBm25 {
    state: Arc<RwLock<Bm25State>>,
    k1: f32,
    b: f32,
}

impl InMemoryBm25 {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(Bm25State::default())),
            k1: 1.2,
            b: 0.75,
        }
    }

        fn tokenize(text: &str) -> Vec<String> {
        let lang = detect(text).map_or(StopWords::English, |info| match info.lang() {
            Lang::Eng => StopWords::English,
            Lang::Spa => StopWords::Spanish,
            Lang::Fra => StopWords::French,
            Lang::Deu => StopWords::German,
            Lang::Rus => StopWords::Russian,
            _ => StopWords::English, // Default to English
        });
        let stop_words: Vec<String> = get_stop_words(lang);
        text.split_whitespace()
            .map(|t| t.trim_matches(|c: char| !c.is_alphanumeric()).to_lowercase())
            .filter(|t| !t.is_empty() && !stop_words.contains(t))
            .collect()
    }

    fn compute_idf(doc_freq: u32, doc_count: u32) -> f32 {
        if doc_count == 0 {
            return 0.0;
        }
        let df = doc_freq.max(1) as f32;
        let n = doc_count as f32;
        ((n - df + 0.5) / (df + 0.5) + 1.0).ln()
    }

    fn bm25_score(&self, tf: u32, dl: usize, avgdl: f32, idf: f32) -> f32 {
        if tf == 0 {
            return 0.0;
        }
        let tf = tf as f32;
        let dl = dl as f32;
        let denom = tf + self.k1 * (1.0 - self.b + self.b * (dl / avgdl.max(1.0)));
        idf * (tf * (self.k1 + 1.0)) / denom
    }
}

impl Default for InMemoryBm25 {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SparseRetriever for InMemoryBm25 {
    async fn add(&self, chunk: &TextChunk) -> RagResult<()> {
        let tokens = Self::tokenize(&chunk.text);
        let mut tf_map: HashMap<String, u32> = HashMap::new();
        for token in tokens.iter() {
            *tf_map.entry(token.clone()).or_insert(0) += 1;
        }

        let dl = tokens.len();

        let mut state = self.state.write().await;

        if !state.chunks.contains_key(&chunk.id) {
            state.doc_count += 1;
        }

        state.total_len = state.total_len.saturating_sub(*state.chunk_len.get(&chunk.id).unwrap_or(&0) as u64);
        state.total_len += dl as u64;

        state.chunks.insert(chunk.id.clone(), chunk.clone());
        state.chunk_len.insert(chunk.id.clone(), dl);

        if let Some(old_tf) = state.term_freqs.insert(chunk.id.clone(), tf_map) {
            for term in old_tf.keys() {
                if let Some(df) = state.doc_freq.get_mut(term) {
                    *df = df.saturating_sub(1);
                    if *df == 0 {
                        state.doc_freq.remove(term);
                    }
                }
            }
        }

        let current_terms: Vec<String> = state
            .term_freqs
            .get(&chunk.id)
            .map(|m| m.keys().cloned().collect())
            .unwrap_or_default();

        for term in current_terms {
            *state.doc_freq.entry(term).or_insert(0) += 1;
        }

        Ok(())
    }

    async fn search(&self, query: &str, top_k: usize) -> RagResult<Vec<(TextChunk, f32)>> {
        let q_terms = Self::tokenize(query);
        if q_terms.is_empty() {
            return Ok(vec![]);
        }

        let state = self.state.read().await;
        if state.doc_count == 0 {
            return Ok(vec![]);
        }

        let avgdl = (state.total_len as f32) / (state.doc_count as f32);

        let mut scored: Vec<(TextChunk, f32)> = Vec::with_capacity(state.chunks.len());

        for (chunk_id, chunk) in state.chunks.iter() {
            let dl = *state.chunk_len.get(chunk_id).unwrap_or(&0);
            let tfs = state.term_freqs.get(chunk_id);

            let mut score = 0.0;
            for term in q_terms.iter() {
                let tf = tfs
                    .and_then(|m| m.get(term))
                    .copied()
                    .unwrap_or(0);
                let df = state.doc_freq.get(term).copied().unwrap_or(0);
                let idf = Self::compute_idf(df, state.doc_count);
                score += self.bm25_score(tf, dl, avgdl, idf);
            }

            if score > 0.0 {
                scored.push((chunk.clone(), score));
            }
        }

        scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        scored.truncate(top_k);

        Ok(scored)
    }

    async fn delete(&self, chunk_id: &str) -> RagResult<()> {
        let mut state = self.state.write().await;
        if let Some(old_tf) = state.term_freqs.remove(chunk_id) {
            for term in old_tf.keys() {
                if let Some(df) = state.doc_freq.get_mut(term) {
                    *df = df.saturating_sub(1);
                    if *df == 0 {
                        state.doc_freq.remove(term);
                    }
                }
            }
        }

        if let Some(old_len) = state.chunk_len.remove(chunk_id) {
            state.total_len = state.total_len.saturating_sub(old_len as u64);
        }

        if state.chunks.remove(chunk_id).is_some() {
            state.doc_count = state.doc_count.saturating_sub(1);
        }

        Ok(())
    }
}
