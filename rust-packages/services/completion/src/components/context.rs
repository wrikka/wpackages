//! Context component stub
//!
//! Note: Implement context management logic would require:
//! - Extracting relevant context from the file being edited
//! - Building context from project structure and imports
//! - Managing context window size and prioritization
//! For now, this is a placeholder that would be replaced with actual context management

use crate::types::CompletionContext;

pub fn build_context(prefix: &str, suffix: &str) -> CompletionContext {
    CompletionContext::new()
        .with_prefix(prefix)
        .with_suffix(suffix)
}
