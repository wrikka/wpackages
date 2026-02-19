//! Feature 27: Human-in-the-Loop Integration

use crate::types::*;
use std::collections::HashMap;

/// Feature 27: Human-in-the-Loop Integration
#[derive(Default)]
pub struct HumanLoop {
    pending_requests: Vec<HumanRequest>,
    learned_decisions: HashMap<String, HumanDecision>,
}

impl HumanLoop {
    /// Request human intervention when necessary
    pub fn request_intervention(&mut self, context: &str) -> HumanRequest {
        let request = HumanRequest {
            id: uuid::Uuid::new_v4().to_string(),
            context: context.to_string(),
            timestamp: std::time::Instant::now(),
        };
        self.pending_requests.push(request.clone());
        request
    }

    /// Provide clear context to humans
    pub fn provide_context(&self, request: &HumanRequest) -> ContextInfo {
        ContextInfo {
            context: request.context.clone(),
            options: vec!["Approve".to_string(), "Reject".to_string()],
        }
    }

    /// Learn from human decisions
    pub fn learn_from_decision(&mut self, decision: &HumanDecision) {
        // Simple learning: store the decision for a given context.
        // A more advanced system could use this data to fine-tune a policy model.
        if let Some(request) = self
            .pending_requests
            .iter()
            .find(|r| r.id == decision.request_id)
        {
            self.learned_decisions
                .insert(request.context.clone(), decision.clone());
        }
        // Remove the resolved request from pending
        self.pending_requests
            .retain(|r| r.id != decision.request_id);
    }
}
