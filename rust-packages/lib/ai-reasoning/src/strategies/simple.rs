use crate::common::{Error, ReasoningInput, ReasoningOutput};
use crate::core::ReasoningStrategy;
use async_trait::async_trait;

/// A simple, direct reasoning strategy.
#[derive(Default)]
pub struct SimpleStrategy;

impl SimpleStrategy {
    /// Creates a new instance of the SimpleStrategy.
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl ReasoningStrategy for SimpleStrategy {
    fn name(&self) -> &str {
        "SimpleStrategy"
    }

    async fn reason(&self, input: &ReasoningInput) -> Result<ReasoningOutput, Error> {
        if input.query.is_empty() {
            return Err(Error::InvalidInput("Query cannot be empty".to_string()));
        }

        // Placeholder logic: Echo the query back as the result.
        let result = format!("Processed query with SimpleStrategy: '{}'", input.query);

        Ok(ReasoningOutput { result })
    }
}
