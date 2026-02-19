//! Executor trait for workflow engine

use crate::error::Result;
use crate::types::{Condition, ExecutionContext};
use async_trait::async_trait;
use serde_json::Value;

/// Trait for workflow executors
///
/// Implement this trait to provide custom action execution logic.
/// The workflow engine is generic over this trait, allowing it to work
/// with browser automation, desktop automation, API calls, or any other
/// action type.
#[async_trait]
pub trait WorkflowExecutor: Send + Sync {
    /// Execute an action with the given parameters
    ///
    /// # Arguments
    /// * `action` - The action name/type to execute
    /// * `params` - JSON parameters for the action
    /// * `context` - Execution context containing workflow state
    ///
    /// # Returns
    /// * `Ok(Some(Value))` - Action succeeded with return data
    /// * `Ok(None)` - Action succeeded with no return data
    /// * `Err(e)` - Action failed
    async fn execute_action(
        &self,
        action: &str,
        params: &Value,
        context: &ExecutionContext,
    ) -> Result<Option<Value>>;

    /// Evaluate a condition
    ///
    /// # Arguments
    /// * `condition` - The condition to evaluate
    /// * `context` - Execution context containing workflow state
    ///
    /// # Returns
    /// * `Ok(true)` - Condition is met
    /// * `Ok(false)` - Condition is not met
    /// * `Err(e)` - Failed to evaluate condition
    async fn evaluate_condition(
        &self,
        condition: &Condition,
        context: &ExecutionContext,
    ) -> Result<bool>;

    /// Extract a value using a selector
    ///
    /// # Arguments
    /// * `selector` - The selector to use for extraction
    /// * `attribute` - Optional attribute to extract
    /// * `context` - Execution context containing workflow state
    ///
    /// # Returns
    /// * `Ok(String)` - Extraction succeeded
    /// * `Err(e)` - Extraction failed
    async fn extract_value(
        &self,
        selector: &str,
        attribute: Option<&str>,
        context: &ExecutionContext,
    ) -> Result<String>;
}

/// A boxed executor for dynamic dispatch
pub type BoxedExecutor = Box<dyn WorkflowExecutor>;
