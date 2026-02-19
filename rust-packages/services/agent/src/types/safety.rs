//! types/safety.rs

/// Describes the potential side effects of an action or tool.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Effect {
    /// The action may write to the file system.
    FileSystemWrite,
    /// The action may make a network request.
    NetworkRequest,
    /// The action has no side effects.
    Pure,
}

/// A trait for safety rules that can be statically verified.
pub trait SafetyRule {
    /// The name of the rule.
    fn name(&self) -> &'static str;
    /// A description of the rule.
    fn description(&self) -> &'static str;
    /// Checks if a given set of effects violates this rule.
    fn check(&self, effects: &[Effect]) -> bool;
}
