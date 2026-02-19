use anyhow::{Context, Result};
use candle_core::{Device, Tensor};
use candle_transformers::models::bert::{BertModel, Config, BertConfig};
use candle_nn::VarBuilder;
use dashmap::DashMap;
use parking_lot::RwLock;
use qdrant_client::prelude::*;
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct CommandNode {
    pub id: Uuid,
    pub command: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub exit_code: Option<i32>,
    pub duration_ms: Option<u64>,
    pub working_dir: String,
    pub related_commands: Vec<Uuid>,
    pub embedding: Option<Vec<f32>>,
}

#[derive(Debug, Clone)]
pub struct CommandRelationship {
    pub from: Uuid,
    pub to: Uuid,
    pub relationship_type: RelationshipType,
    pub weight: f32,
}

#[derive(Debug, Clone)]
pub enum RelationshipType {
    Sequential,
    Similar,
    Dependent,
    Alternative,
    Related,
}

pub struct KnowledgeGraph {
    nodes: Arc<DashMap<Uuid, CommandNode>>,
    relationships: Arc<DashMap<(Uuid, Uuid), CommandRelationship>>,
    embedding_model: Option<Arc<BertModel>>,
    qdrant_client: Option<Arc<QdrantClient>>,
    device: Device,
}

impl KnowledgeGraph {
    pub async fn new(qdrant_url: Option<String>) -> Result<Self> {
        let device = Device::Cpu;

        let embedding_model = Self::load_embedding_model(&device).ok();

        let qdrant_client = if let Some(url) = qdrant_url {
            Some(Arc::new(
                QdrantClient::from_url(url.as_str()).build()?
            ))
        } else {
            None
        };

        Ok(Self {
            nodes: Arc::new(DashMap::new()),
            relationships: Arc::new(DashMap::new()),
            embedding_model,
            qdrant_client,
            device,
        })
    }

    pub fn add_command(&self, command: String, working_dir: String) -> Result<Uuid> {
        let id = Uuid::new_v4();
        let node = CommandNode {
            id,
            command: command.clone(),
            timestamp: chrono::Utc::now(),
            exit_code: None,
            duration_ms: None,
            working_dir,
            related_commands: vec![],
            embedding: None,
        };

        self.nodes.insert(id, node);

        if let Some(model) = &self.embedding_model {
            if let Ok(embedding) = self.compute_embedding(model, &command) {
                self.nodes.update(&id, |_, node| node.embedding = Some(embedding));
            }
        }

        Ok(id)
    }

    pub fn update_command_result(&self, id: Uuid, exit_code: i32, duration_ms: u64) -> Result<()> {
        if let Some(mut node) = self.nodes.get_mut(&id) {
            node.exit_code = Some(exit_code);
            node.duration_ms = Some(duration_ms);
        }
        Ok(())
    }

    pub fn add_relationship(&self, from: Uuid, to: Uuid, relationship_type: RelationshipType, weight: f32) {
        let relationship = CommandRelationship {
            from,
            to,
            relationship_type,
            weight,
        };
        self.relationships.insert((from, to), relationship);
    }

    pub fn find_similar_commands(&self, query: &str, limit: usize) -> Vec<(Uuid, f32)> {
        let mut results: Vec<(Uuid, f32)> = Vec::new();

        if let Some(model) = &self.embedding_model {
            if let Ok(query_embedding) = self.compute_embedding(model, query) {
                for entry in self.nodes.iter() {
                    if let Some(embedding) = &entry.value().embedding {
                        let similarity = self.cosine_similarity(&query_embedding, embedding);
                        results.push((entry.key().clone(), similarity));
                    }
                }
            }
        } else {
            for entry in self.nodes.iter() {
                let similarity = self.string_similarity(query, &entry.value().command);
                results.push((entry.key().clone(), similarity));
            }
        }

        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        results.into_iter().take(limit).collect()
    }

    pub fn get_command_history(&self, limit: usize) -> Vec<CommandNode> {
        let mut commands: Vec<CommandNode> = self.nodes
            .iter()
            .map(|entry| entry.value().clone())
            .collect();

        commands.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        commands.into_iter().take(limit).collect()
    }

    pub fn get_frequent_commands(&self, limit: usize) -> Vec<(String, usize)> {
        let mut frequency: HashMap<String, usize> = HashMap::new();

        for entry in self.nodes.iter() {
            let command = entry.value().command.clone();
            *frequency.entry(command).or_insert(0) += 1;
        }

        let mut results: Vec<(String, usize)> = frequency.into_iter().collect();
        results.sort_by(|a, b| b.1.cmp(&a.1));
        results.into_iter().take(limit).collect()
    }

    pub fn get_command_suggestions(&self, partial: &str, limit: usize) -> Vec<String> {
        let mut suggestions: Vec<String> = self.nodes
            .iter()
            .filter(|entry| entry.value().command.starts_with(partial))
            .map(|entry| entry.value().command.clone())
            .collect();

        suggestions.sort();
        suggestions.dedup();
        suggestions.into_iter().take(limit).collect()
    }

    pub fn analyze_patterns(&self) -> Vec<PatternInsight> {
        let mut insights = Vec::new();

        let frequent = self.get_frequent_commands(10);
        for (command, count) in frequent {
            if count > 5 {
                insights.push(PatternInsight {
                    insight_type: InsightType::FrequentCommand,
                    description: format!("You run '{}' {} times frequently", command, count),
                    value: command,
                    confidence: (count as f32 / 100.0).min(1.0),
                });
            }
        }

        insights
    }

    fn load_embedding_model(device: &Device) -> Result<Arc<BertModel>> {
        let config = BertConfig::tiny_en();
        let vb = VarBuilder::empty(device);
        let model = BertModel::load(vb, &config)?;
        Ok(Arc::new(model))
    }

    fn compute_embedding(&self, model: &BertModel, text: &str) -> Result<Vec<f32>> {
        let tokens = self.tokenize(text);
        let input_ids = Tensor::new(tokens, &self.device)?.unsqueeze(0)?;

        let output = model.forward(&input_ids, None)?;
        let embedding = output.squeeze(0)?.to_vec1::<f32>()?;

        Ok(embedding)
    }

    fn tokenize(&self, text: &str) -> Vec<u32> {
        text.chars()
            .take(512)
            .map(|c| c as u32)
            .collect()
    }

    fn cosine_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

        if norm_a == 0.0 || norm_b == 0.0 {
            0.0
        } else {
            dot_product / (norm_a * norm_b)
        }
    }

    fn string_similarity(&self, a: &str, b: &str) -> f32 {
        let distance = levenshtein::levenshtein(a, b);
        let max_len = a.len().max(b.len());

        if max_len == 0 {
            1.0
        } else {
            1.0 - (distance as f32 / max_len as f32)
        }
    }

    pub async fn search_qdrant(&self, query: &str, limit: usize) -> Result<Vec<SearchResult>> {
        if let Some(client) = &self.qdrant_client {
            if let Some(model) = &self.embedding_model {
                let query_embedding = self.compute_embedding(model, query)?;

                let search_result = client
                    .search_points(&SearchPoints {
                        collection_name: "terminal_commands".to_string(),
                        vector: query_embedding,
                        limit: limit as u64,
                        with_payload: Some(true.into()),
                        ..Default::default()
                    })
                    .await?;

                Ok(search_result
                    .result
                    .into_iter()
                    .map(|point| SearchResult {
                        id: point.id,
                        score: point.score,
                        payload: point.payload,
                    })
                    .collect())
            } else {
                Ok(vec![])
            }
        } else {
            Ok(vec![])
        }
    }
}

#[derive(Debug, Clone)]
pub struct PatternInsight {
    pub insight_type: InsightType,
    pub description: String,
    pub value: String,
    pub confidence: f32,
}

#[derive(Debug, Clone)]
pub enum InsightType {
    FrequentCommand,
    SequentialPattern,
    ErrorPattern,
    PerformanceIssue,
}

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub id: PointId,
    pub score: f32,
    pub payload: HashMap<String, Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_knowledge_graph() {
        let graph = KnowledgeGraph::new(None).await.unwrap();

        let id = graph.add_command("ls -la".to_string(), "/home/user".to_string()).unwrap();
        assert_eq!(graph.nodes.len(), 1);

        let suggestions = graph.get_command_suggestions("ls", 10);
        assert_eq!(suggestions.len(), 1);
    }
}
