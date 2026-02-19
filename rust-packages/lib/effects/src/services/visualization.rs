use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Graph node representing an effect
#[derive(Debug, Clone)]
pub struct EffectNode {
    pub id: String,
    pub name: String,
    pub effect_type: String,
    pub inputs: Vec<String>,
    pub outputs: Vec<String>,
}

/// Graph edge representing dependency
#[derive(Debug, Clone)]
pub struct EffectEdge {
    pub from: String,
    pub to: String,
    pub edge_type: EdgeType,
}

#[derive(Debug, Clone)]
pub enum EdgeType {
    Sequential,
    Parallel,
    Fallback,
    Retry,
}

/// Effect graph
#[derive(Debug, Default)]
pub struct EffectGraph {
    nodes: Arc<Mutex<HashMap<String, EffectNode>>>,
    edges: Arc<Mutex<Vec<EffectEdge>>>,
}

impl EffectGraph {
    pub fn new() -> Self {
        Self {
            nodes: Arc::new(Mutex::new(HashMap::new())),
            edges: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn add_node(&self, node: EffectNode) {
        let mut nodes = self.nodes.lock().await;
        nodes.insert(node.id.clone(), node);
    }

    pub async fn add_edge(&self, edge: EffectEdge) {
        let mut edges = self.edges.lock().await;
        edges.push(edge);
    }

    pub async fn to_dot(&self) -> String {
        let nodes = self.nodes.lock().await;
        let edges = self.edges.lock().await;

        let mut dot = String::from("digraph EffectGraph {\n");
        dot.push_str("  rankdir=TB;\n");
        dot.push_str("  node [shape=box];\n\n");

        // Add nodes
        for (id, node) in nodes.iter() {
            dot.push_str(&format!("  \"{}\" [label=\"{}\"];\n", id, node.name));
        }

        dot.push_str("\n");

        // Add edges
        for edge in edges.iter() {
            let style = match edge.edge_type {
                EdgeType::Sequential => "solid",
                EdgeType::Parallel => "dashed",
                EdgeType::Fallback => "dotted",
                EdgeType::Retry => "bold",
            };
            dot.push_str(&format!(
                "  \"{}\" -> \"{}\" [style={}];\n",
                edge.from, edge.to, style
            ));
        }

        dot.push_str("}\n");
        dot
    }

    pub async fn to_mermaid(&self) -> String {
        let nodes = self.nodes.lock().await;
        let edges = self.edges.lock().await;

        let mut mermaid = String::from("graph TD\n");

        for (id, node) in nodes.iter() {
            mermaid.push_str(&format!("  {}[{}]\n", id, node.name));
        }

        for edge in edges.iter() {
            let line = match edge.edge_type {
                EdgeType::Sequential => "-->",
                EdgeType::Parallel => "-.->",
                EdgeType::Fallback => "-.-",
                EdgeType::Retry => "==>",
            };
            mermaid.push_str(&format!("  {} {} {}\n", edge.from, line, edge.to));
        }

        mermaid
    }
}

/// Graph visualization extension
pub trait GraphExt<T, E, R> {
    /// Register effect in graph
    fn with_graph_tracking(self, graph: Arc<EffectGraph>, node_id: impl Into<String>, name: impl Into<String>) -> Effect<T, E, R>;

    /// Chain with another effect (creates edge)
    fn chain_with(self, next: Effect<T, E, R>, graph: Arc<EffectGraph>) -> Effect<T, E, R>;
}

impl<T, E, R> GraphExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_graph_tracking(self, graph: Arc<EffectGraph>, node_id: impl Into<String>, name: impl Into<String>) -> Effect<T, E, R> {
        let node_id = node_id.into();
        let name = name.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let graph = graph.clone();
            let node_id = node_id.clone();
            let name = name.clone();

            Box::pin(async move {
                // Register node
                graph.add_node(EffectNode {
                    id: node_id.clone(),
                    name: name.clone(),
                    effect_type: "effect".to_string(),
                    inputs: vec![],
                    outputs: vec![],
                }).await;

                effect.run(ctx).await
            })
        })
    }

    fn chain_with(self, next: Effect<T, E, R>, graph: Arc<EffectGraph>) -> Effect<T, E, R> {
        #[cfg(feature = "distributed")]
        let (self_id, next_id) = (uuid::Uuid::new_v4().to_string(), uuid::Uuid::new_v4().to_string());
        #[cfg(not(feature = "distributed"))]
        let (self_id, next_id) = (
            format!("node-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos()),
            format!("node-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos())
        );

        Effect::new(move |ctx: R| {
            let first = self.clone();
            let second = next.clone();
            let ctx = ctx.clone();
            let graph = graph.clone();
            let self_id = self_id.clone();
            let next_id = next_id.clone();

            Box::pin(async move {
                // Register nodes and edge
                graph.add_node(EffectNode {
                    id: self_id.clone(),
                    name: "first".to_string(),
                    effect_type: "effect".to_string(),
                    inputs: vec![],
                    outputs: vec![],
                }).await;

                graph.add_node(EffectNode {
                    id: next_id.clone(),
                    name: "second".to_string(),
                    effect_type: "effect".to_string(),
                    inputs: vec![],
                    outputs: vec![],
                }).await;

                graph.add_edge(EffectEdge {
                    from: self_id,
                    to: next_id,
                    edge_type: EdgeType::Sequential,
                }).await;

                // Execute sequentially
                let _ = first.run(ctx.clone()).await?;
                second.run(ctx).await
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_graph_dot() {
        let graph = Arc::new(EffectGraph::new());

        graph.add_node(EffectNode {
            id: "a".to_string(),
            name: "Effect A".to_string(),
            effect_type: "effect".to_string(),
            inputs: vec![],
            outputs: vec![],
        }).await;

        graph.add_node(EffectNode {
            id: "b".to_string(),
            name: "Effect B".to_string(),
            effect_type: "effect".to_string(),
            inputs: vec![],
            outputs: vec![],
        }).await;

        graph.add_edge(EffectEdge {
            from: "a".to_string(),
            to: "b".to_string(),
            edge_type: EdgeType::Sequential,
        }).await;

        let dot = graph.to_dot().await;
        assert!(dot.contains("digraph"));
        assert!(dot.contains("Effect A"));
        assert!(dot.contains("Effect B"));
    }
}
