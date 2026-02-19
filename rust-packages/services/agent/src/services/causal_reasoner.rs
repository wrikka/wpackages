//! services/causal_reasoner.rs

use crate::types::causal::{CausalGraph, CausalLink, CausalNode};
use std::collections::HashMap;

/// A service for building and querying a causal model of the environment.
#[derive(Clone, Default)]
pub struct CausalReasoner {
    graph: CausalGraph,
}

impl CausalReasoner {
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds a new causal link to the model.
    pub fn add_link(&mut self, cause_desc: &str, effect_desc: &str, weight: f64) {
        let cause_id = cause_desc.to_lowercase().replace(' ', "_");
        let effect_id = effect_desc.to_lowercase().replace(' ', "_");

        if !self.graph.nodes.iter().any(|n| n.id == cause_id) {
            self.graph.nodes.push(CausalNode { id: cause_id.clone(), description: cause_desc.to_string() });
        }
        if !self.graph.nodes.iter().any(|n| n.id == effect_id) {
            self.graph.nodes.push(CausalNode { id: effect_id.clone(), description: effect_desc.to_string() });
        }

        self.graph.links.push(CausalLink { cause: cause_id, effect: effect_id, weight });
    }

    /// Queries the model to find the most likely causes for a given effect.
    pub fn find_causes(&self, effect_id: &str) -> Vec<&CausalNode> {
        let mut causes = self.graph.links.iter()
            .filter(|link| link.effect == effect_id)
            .map(|link| self.graph.nodes.iter().find(|n| n.id == link.cause).unwrap())
            .collect::<Vec<_>>();
        
        causes.sort_by(|a, b| {
            let weight_a = self.graph.links.iter().find(|l| l.cause == a.id && l.effect == effect_id).unwrap().weight;
            let weight_b = self.graph.links.iter().find(|l| l.cause == b.id && l.effect == effect_id).unwrap().weight;
            weight_b.partial_cmp(&weight_a).unwrap()
        });

        causes
    }
}
