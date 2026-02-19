use crate::config::VectorSearchConfig;
use crate::error::{VectorSearchError, VectorSearchResult};
use crate::types::{DistanceMetric, SearchQuery, SearchResult, Vector};
use rayon::prelude::*;

pub struct VectorIndex {
    vectors: Vec<Vector>,
    metadata: Vec<serde_json::Value>,
    config: VectorSearchConfig,
}

impl VectorIndex {
    pub fn new(config: VectorSearchConfig) -> VectorSearchResult<Self> {
        config.validate()?;

        Ok(Self {
            vectors: Vec::new(),
            metadata: Vec::new(),
            config,
        })
    }

    pub fn add(
        &mut self,
        vector: Vector,
        metadata: Option<serde_json::Value>,
    ) -> VectorSearchResult<()> {
        if vector.len() != self.config.dimension {
            return Err(VectorSearchError::DimensionMismatch {
                expected: self.config.dimension,
                got: vector.len(),
            });
        }

        self.vectors.push(vector);
        self.metadata
            .push(metadata.unwrap_or(serde_json::Value::Null));

        Ok(())
    }

    pub fn add_batch(
        &mut self,
        vectors: Vec<Vector>,
        metadata: Vec<Option<serde_json::Value>>,
    ) -> VectorSearchResult<()> {
        if vectors.len() != metadata.len() {
            return Err(VectorSearchError::InvalidConfig(
                "Vectors and metadata must have the same length".to_string(),
            ));
        }

        for (vector, meta) in vectors.into_iter().zip(metadata.into_iter()) {
            self.add(vector, meta)?;
        }

        Ok(())
    }

    pub fn search(&self, query: SearchQuery) -> VectorSearchResult<Vec<SearchResult>> {
        if query.vector.len() != self.config.dimension {
            return Err(VectorSearchError::DimensionMismatch {
                expected: self.config.dimension,
                got: query.vector.len(),
            });
        }

        let metric = query.metric.unwrap_or(self.config.default_metric);

        let results: Vec<SearchResult> = if self.config.parallel {
            self.vectors
                .par_iter()
                .enumerate()
                .map(|(idx, vector)| {
                    let score = crate::components::compute_distance(&query.vector, vector, metric)
                        .unwrap_or_else(|e| {
                            tracing::error!("Failed to compute distance: {}", e);
                            f32::NEG_INFINITY
                        });
                    SearchResult {
                        index: idx as u32,
                        score,
                        metadata: self.metadata[idx].clone(),
                    }
                })
                .collect()
        } else {
            self.vectors
                .iter()
                .enumerate()
                .map(|(idx, vector)| {
                    let score = crate::components::compute_distance(&query.vector, vector, metric)
                        .unwrap_or_else(|e| {
                            tracing::error!("Failed to compute distance: {}", e);
                            f32::NEG_INFINITY
                        });
                    SearchResult {
                        index: idx as u32,
                        score,
                        metadata: self.metadata[idx].clone(),
                    }
                })
                .collect()
        };

        let mut filtered_results = results;

        if let Some(threshold) = query.threshold {
            filtered_results = filtered_results
                .into_iter()
                .filter(|r| r.score >= threshold)
                .collect();
        }

        let mut sorted_results = filtered_results;
        sorted_results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

        Ok(sorted_results.into_iter().take(query.top_k).collect())
    }

    pub fn search_with_threshold(
        &self,
        query: Vector,
        threshold: f32,
    ) -> VectorSearchResult<Vec<SearchResult>> {
        self.search(SearchQuery::new(query, usize::MAX).with_threshold(threshold))
    }

    pub fn search_with_metric(
        &self,
        query: Vector,
        top_k: usize,
        metric: DistanceMetric,
    ) -> VectorSearchResult<Vec<SearchResult>> {
        self.search(SearchQuery::new(query, top_k).with_metric(metric))
    }

    pub fn len(&self) -> u32 {
        self.vectors.len() as u32
    }

    pub fn is_empty(&self) -> bool {
        self.vectors.is_empty()
    }

    pub fn clear(&mut self) {
        self.vectors.clear();
        self.metadata.clear();
    }

    pub fn remove(&mut self, index: u32) -> VectorSearchResult<()> {
        let idx = index as usize;
        if idx >= self.vectors.len() {
            return Err(VectorSearchError::IndexOutOfBounds {
                index: idx,
                size: self.vectors.len(),
            });
        }

        self.vectors.remove(idx);
        self.metadata.remove(idx);

        Ok(())
    }

    pub fn get_dimension(&self) -> usize {
        self.config.dimension
    }

    pub fn get_config(&self) -> &VectorSearchConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vector_index() {
        let config = VectorSearchConfig::new(3);
        let mut index = VectorIndex::new(config).unwrap();

        index.add(vec![1.0, 0.0, 0.0], None).unwrap();
        index.add(vec![0.0, 1.0, 0.0], None).unwrap();
        index.add(vec![0.0, 0.0, 1.0], None).unwrap();

        assert_eq!(index.len(), 3);

        let results = index
            .search(SearchQuery::new(vec![1.0, 0.0, 0.0], 2))
            .unwrap();
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].index, 0);
    }

    #[test]
    fn test_vector_index_dimension_mismatch() {
        let config = VectorSearchConfig::new(3);
        let mut index = VectorIndex::new(config).unwrap();

        let result = index.add(vec![1.0, 0.0], None);
        assert!(result.is_err());
    }

    #[test]
    fn test_vector_index_remove() {
        let config = VectorSearchConfig::new(3);
        let mut index = VectorIndex::new(config).unwrap();

        index.add(vec![1.0, 0.0, 0.0], None).unwrap();
        index.add(vec![0.0, 1.0, 0.0], None).unwrap();

        index.remove(0).unwrap();
        assert_eq!(index.len(), 1);
    }

    #[test]
    fn test_vector_index_remove_out_of_bounds() {
        let config = VectorSearchConfig::new(3);
        let mut index = VectorIndex::new(config).unwrap();

        index.add(vec![1.0, 0.0, 0.0], None).unwrap();

        let result = index.remove(10);
        assert!(result.is_err());
    }
}
