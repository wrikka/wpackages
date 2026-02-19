//! Advanced types for AI and automation features

use serde::{Deserialize, Serialize};

/// System state representation
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SystemState {
    pub components: Vec<String>,
    pub status: String,
}

/// Recovery plan for error handling
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryPlan {
    pub steps: Vec<RecoveryStep>,
    pub estimated_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryStep {
    pub action: String,
    pub description: String,
}

/// Security policy definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityPolicy {
    pub name: String,
    pub rules: Vec<SecurityRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityRule {
    pub action: String,
    pub allowed: bool,
    pub conditions: Vec<String>,
}

/// Human-in-the-loop types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HumanRequest {
    pub id: String,
    pub prompt: String,
    pub options: Vec<String>,
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HumanDecision {
    pub request_id: String,
    pub choice: String,
    pub timestamp: u64,
}

/// Context and explanation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextInfo {
    pub environment: String,
    pub variables: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionExplanation {
    pub reasoning: String,
    pub alternatives: Vec<String>,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Explanation {
    pub summary: String,
    pub details: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualExplanation {
    pub highlights: Vec<Highlight>,
    pub annotations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Highlight {
    pub bounds: crate::types::BoundingBox,
    pub color: String,
    pub label: String,
}

/// Transparency and validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransparencyReport {
    pub actions: Vec<ActionTrace>,
    pub decisions: Vec<DecisionTrace>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionTrace {
    pub action: String,
    pub timestamp: u64,
    pub result: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionTrace {
    pub decision: String,
    pub reasoning: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Validator {
    pub rules: Vec<ValidationRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    pub name: String,
    pub description: String,
}

/// Compliance types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompliancePolicy {
    pub id: String,
    pub name: String,
    pub rules: Vec<ComplianceRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRule {
    pub code: String,
    pub description: String,
    pub severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceViolation {
    pub rule_code: String,
    pub description: String,
    pub severity: String,
}

/// User interaction types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clarification {
    pub question: String,
    pub context: String,
    pub options: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pattern {
    pub id: String,
    pub name: String,
    pub template: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub steps: Vec<WorkflowStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub action: String,
    pub parameters: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Suggestion {
    pub id: String,
    pub text: String,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

/// Help and documentation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HelpContent {
    pub topic: String,
    pub content: String,
    pub examples: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shortcut {
    pub key: String,
    pub action: String,
    pub description: String,
}

/// Cross-app workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossAppWorkflow {
    pub id: String,
    pub apps: Vec<String>,
    pub data_flow: Vec<DataFlowStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFlowStep {
    pub source_app: String,
    pub target_app: String,
    pub data_type: String,
}

/// Integration and improvement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Integration {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub config: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Improvement {
    pub id: String,
    pub description: String,
    pub impact: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metric {
    pub name: String,
    pub value: f64,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Optimization {
    pub id: String,
    pub target: String,
    pub strategy: String,
}

/// Bottleneck analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bottleneck {
    pub id: String,
    pub location: String,
    pub severity: String,
    pub description: String,
}

/// Tool definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tool {
    pub id: String,
    pub name: String,
    pub description: String,
    pub parameters: std::collections::HashMap<String, String>,
}
