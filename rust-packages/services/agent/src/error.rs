use thiserror::Error;

#[derive(Error, Debug)]
pub enum AgentError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Agent not found (id: {agent_id})")]
    AgentNotFound { agent_id: String },

    #[error("Plan not found (id: {plan_id})")]
    PlanNotFound { plan_id: String },

    #[error("Task not found (id: {task_id})")]
    TaskNotFound { task_id: String },

    #[error("Tool not found (name: {tool_name})")]
    ToolNotFound { tool_name: String },

    #[error("Workflow not found (id: {workflow_id})")]
    WorkflowNotFound { workflow_id: String },

    #[error("Task execution failed: {task_id}")]
    TaskExecutionFailed {
        task_id: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Tool execution failed: {tool_name}")]
    ToolExecutionFailed {
        tool_name: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Model request failed: {provider}")]
    ModelRequestFailed {
        provider: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Memory error: {0}")]
    Memory(#[from] cache::CacheError),

    #[error("Browser error: {0}")]
    Browser(#[from] browser_use::error::Error),

    #[error("Embeddings error: {0}")]
    Embeddings(#[from] embeddings::EmbeddingsError),

    #[error("Vector search error: {0}")]
    VectorSearch(#[from] semantic_search::VectorSearchError),

    #[error("RAG error: {0}")]
    Rag(#[from] rags::RagError),

    #[error("External service failed: {service_name}")]
    ServiceError {
        service_name: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Timeout: operation exceeded {timeout_seconds}s")]
    Timeout { timeout_seconds: u64 },

    #[error("Rate limit exceeded: {limit} requests per minute")]
    RateLimitExceeded { limit: u32 },

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Serde(#[from] serde_json::Error),

    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),

    #[error("OpenAI error: {0}")]
    OpenAI(#[from] async_openai::error::OpenAIError),
}

pub type Result<T> = std::result::Result<T, AgentError>;
