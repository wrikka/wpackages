// Pure components layer - no side effects, no I/O
pub mod inverted_index;
pub mod tokenizer;

// Re-export pure functions
pub use inverted_index::*;
pub use tokenizer::*;

#[cfg(test)]
mod tests;
