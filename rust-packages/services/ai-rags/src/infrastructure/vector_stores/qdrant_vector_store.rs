use crate::adapters::vector_store::VectorStore;
use crate::domain::{MetadataFilter, TextChunk};
use crate::error::{RagError, RagResult};
use async_trait::async_trait;
use qdrant_client::prelude::{Payload, QdrantClient, QdrantClientConfig};
use qdrant_client::qdrant::{
    condition::ConditionOneOf,
    CreateCollection,
    Distance,
    Filter,
    PointStruct,
    SearchPoints,
    VectorParams,
    VectorsConfig,
    Condition,
    FieldCondition,
    Match,
    Value,
};
use serde_json::json;
use std::collections::HashMap;

pub struct QdrantVectorStore {
    client: QdrantClient,
    collection_name: String,
}

impl QdrantVectorStore {
    pub async fn new(url: &str, collection_name: &str) -> RagResult<Self> {
        let client = QdrantClient::new(Some(QdrantClientConfig::from_url(url)))
            .await
            .map_err(|e| RagError::VectorStore(e.to_string()))?;

        if !client.collection_exists(collection_name).await.unwrap_or(false) {
            client
                .create_collection(&CreateCollection {
                    collection_name: collection_name.to_string(),
                    vectors_config: Some(VectorsConfig {
                        config: Some(qdrant_client::qdrant::vectors_config::Config::Params(
                            VectorParams {
                                size: 1536, // OpenAI text-embedding-3-small
                                distance: Distance::Cosine.into(),
                                ..Default::default()
                            },
                        )),
                    }),
                    ..Default::default()
                })
                .await
                .map_err(|e| RagError::VectorStore(e.to_string()))?;
        }

        Ok(Self { client, collection_name: collection_name.to_string() })
    }
}

#[async_trait]
impl VectorStore for QdrantVectorStore {
    async fn add(&self, chunk: &TextChunk, embedding: Vec<f32>) -> RagResult<()> {
        self.add_batch(&[chunk.clone()], &[embedding]).await
    }

    async fn add_batch(&self, chunks: &[TextChunk], embeddings: &[Vec<f32>]) -> RagResult<()> {
        let points = chunks
            .iter()
            .zip(embeddings.iter())
            .map(|(chunk, embedding)| {
                let payload: Payload = serde_json::from_value(json!({
                    "document_id": chunk.document_id,
                    "text": chunk.text,
                    "metadata": chunk.metadata
                })).unwrap();

                PointStruct::new(chunk.id.clone(), embedding.clone(), payload)
            })
            .collect();

        self.client
            .upsert_points(&self.collection_name, points, None)
            .await
            .map_err(|e| RagError::VectorStore(e.to_string()))?;

        Ok(())
    }

    async fn search(
        &self,
        query_embedding: &[f32],
        top_k: usize,
        filter: Option<&MetadataFilter>,
    ) -> RagResult<Vec<(TextChunk, f32)>> {
        let qdrant_filter = filter.and_then(|f| {
            if f.filters.is_empty() {
                None
            } else {
                let conditions = f
                    .filters
                    .iter()
                    .map(|(key, value)| {
                        Condition {
                            condition_one_of: Some(ConditionOneOf::Field(FieldCondition {
                                key: format!("metadata.{}", key),
                                r#match: Some(Match {
                                    match_value: Some(Value::from(value.clone())),
                                }),
                                ..Default::default()
                            })),
                        }
                    })
                    .collect();
                Some(Filter { must: conditions, ..Default::default() })
            }
        });

        let search_result = self
            .client
            .search_points(&SearchPoints {
                collection_name: self.collection_name.clone(),
                vector: query_embedding.to_vec(),
                limit: top_k as u64,
                with_payload: Some(true.into()),
                filter: qdrant_filter,
                ..Default::default()
            })
            .await
            .map_err(|e| RagError::VectorStore(e.to_string()))?;

        let results = search_result
            .result
            .into_iter()
            .map(|point| {
                let mut payload = point.payload;
                let text_chunk = TextChunk {
                    id: point.id.to_string(),
                    document_id: payload.remove("document_id").unwrap().into_json(),
                    text: payload.remove("text").unwrap().into_json(),
                    metadata: payload.remove("metadata").and_then(|v| serde_json::from_value(v.into_json()).ok()),
                };
                (text_chunk, point.score)
            })
            .collect();

        Ok(results)
    }
            }

    async fn delete(&self, chunk_id: &str) -> RagResult<()> {
        self.client
            .delete_points(&self.collection_name, &[chunk_id.into()].into(), None)
            .await
            .map_err(|e| RagError::VectorStore(e.to_string()))?;
        Ok(())
    }
}
