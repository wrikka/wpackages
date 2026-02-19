use serde::{Deserialize, Serialize};

/// Configuration for the vector database
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorDBConfig {
    pub db_type: String,
    pub url: String,
    pub collection_name: String,
}
