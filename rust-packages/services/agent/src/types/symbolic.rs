//! types/symbolic.rs

/// Represents a symbolic expression to be evaluated.
#[derive(Debug, Clone)]
pub struct SymbolicExpression {
    pub expression: String, // e.g., "2 * x = 10"
}

/// Represents the result of a symbolic evaluation.
#[derive(Debug, Clone)]
pub struct SymbolicResult {
    pub result: String, // e.g., "x = 5"
}
