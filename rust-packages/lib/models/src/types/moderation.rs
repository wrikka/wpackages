use serde::{Deserialize, Serialize};

/// A request to the moderation endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationRequest {
    pub input: String,
    pub model: Option<String>,
}

/// The response from the moderation endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationResponse {
    pub id: String,
    pub model: String,
    pub results: Vec<ModerationResult>,
}

/// The result of a moderation check.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationResult {
    pub flagged: bool,
    pub categories: ModerationCategories,
    pub category_scores: ModerationCategoryScores,
}

/// The categories of moderation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationCategories {
    pub sexual: bool,
    pub hate: bool,
    pub harassment: bool,
    #[serde(rename = "self-harm")]
    pub self_harm: bool,
    #[serde(rename = "sexual/minors")]
    pub sexual_minors: bool,
    #[serde(rename = "hate/threatening")]
    pub hate_threatening: bool,
    #[serde(rename = "violence/graphic")]
    pub violence_graphic: bool,
    #[serde(rename = "self-harm/intent")]
    pub self_harm_intent: bool,
    #[serde(rename = "self-harm/instructions")]
    pub self_harm_instructions: bool,
    #[serde(rename = "harassment/threatening")]
    pub harassment_threatening: bool,
    pub violence: bool,
}

/// The scores for each moderation category.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationCategoryScores {
    pub sexual: f64,
    pub hate: f64,
    pub harassment: f64,
    #[serde(rename = "self-harm")]
    pub self_harm: f64,
    #[serde(rename = "sexual/minors")]
    pub sexual_minors: f64,
    #[serde(rename = "hate/threatening")]
    pub hate_threatening: f64,
    #[serde(rename = "violence/graphic")]
    pub violence_graphic: f64,
    #[serde(rename = "self-harm/intent")]
    pub self_harm_intent: f64,
    #[serde(rename = "self-harm/instructions")]
    pub self_harm_instructions: f64,
    #[serde(rename = "harassment/threatening")]
    pub harassment_threatening: f64,
    pub violence: f64,
}
