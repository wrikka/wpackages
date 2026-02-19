//! dsl/parser.rs

use crate::dsl::grammar::AgentDefinition;

/// A simple parser for the agent definition language.
pub struct Parser;

impl Parser {
    /// Parses a DSL string into an `AgentDefinition` AST.
    ///
    /// This is a simplified implementation for demonstration purposes.
    pub fn parse(input: &str) -> Result<AgentDefinition, String> {
        let name = input
            .lines()
            .find(|line| line.starts_with("agent "))
            .map(|line| line.trim_start_matches("agent ").trim().to_string())
            .ok_or_else(|| "Agent name not found".to_string())?;

        Ok(AgentDefinition { name })
    }
}
