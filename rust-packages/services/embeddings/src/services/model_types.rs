#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ModelType {
    Bert,
    Roberta,
    DistilBert,
    SentenceBert,
}

impl std::fmt::Display for ModelType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelType::Bert => write!(f, "bert"),
            ModelType::Roberta => write!(f, "roberta"),
            ModelType::DistilBert => write!(f, "distilbert"),
            ModelType::SentenceBert => write!(f, "sentence-bert"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ModelInfo {
    pub name: String,
    pub model_type: ModelType,
    pub dimension: usize,
    pub max_length: usize,
    pub config: crate::config::EmbeddingsConfig,
}
