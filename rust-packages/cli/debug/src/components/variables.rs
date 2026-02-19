use crate::error::{DebugError, DebugResult};
use crate::types::{EvaluationResult, Scope};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Variable value
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableValue {
    Number(i64),
    Float(f64),
    String(String),
    Boolean(bool),
    Null,
    Array(Vec<VariableValue>),
    Object(HashMap<String, VariableValue>),
    Struct(HashMap<String, VariableValue>),
    Reference(i64),
}

impl VariableValue {
    pub fn display(&self) -> String {
        match self {
            VariableValue::Number(n) => n.to_string(),
            VariableValue::Float(f) => f.to_string(),
            VariableValue::String(s) => format!("\"{}\"", s),
            VariableValue::Boolean(b) => b.to_string(),
            VariableValue::Null => "null".to_string(),
            VariableValue::Array(arr) => format!("[{} elements]", arr.len()),
            VariableValue::Object(obj) => format!("{{{} keys}}", obj.len()),
            VariableValue::Struct(obj) => format!("{{{} fields}}", obj.len()),
            VariableValue::Reference(ref_id) => format!("<ref {}>", ref_id),
        }
    }
}

/// Variable
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Variable {
    pub name: String,
    pub value: VariableValue,
    pub type_name: Option<String>,
    pub variables_reference: Option<i64>,
    pub named_variables: Option<i64>,
    pub indexed_variables: Option<i64>,
    pub evaluate_name: Option<String>,
}

impl Variable {
    pub fn new(name: impl Into<String>, value: VariableValue) -> Self {
        Self {
            name: name.into(),
            value,
            type_name: None,
            variables_reference: None,
            named_variables: None,
            indexed_variables: None,
            evaluate_name: None,
        }
    }

    pub fn with_type(mut self, type_name: impl Into<String>) -> Self {
        self.type_name = Some(type_name.into());
        self
    }

    pub fn with_variables_reference(mut self, ref_id: i64) -> Self {
        self.variables_reference = Some(ref_id);
        self
    }

    pub fn with_evaluate_name(mut self, name: impl Into<String>) -> Self {
        self.evaluate_name = Some(name.into());
        self
    }

    pub fn is_reference(&self) -> bool {
        matches!(self.value, VariableValue::Reference(_))
    }

    pub fn is_container(&self) -> bool {
        matches!(
            self.value,
            VariableValue::Array(_) | VariableValue::Object(_) | VariableValue::Struct(_)
        )
    }

    pub fn has_children(&self) -> bool {
        self.variables_reference.is_some() || self.is_container()
    }
}

/// Variable manager
#[derive(Debug, Clone)]
pub struct VariableManager {
    variables: Arc<Mutex<HashMap<i64, Vec<Variable>>>>,
    scopes: Arc<Mutex<Vec<Scope>>>>,
}

impl VariableManager {
    pub fn new() -> Self {
        Self {
            variables: Arc::new(Mutex::new(HashMap::new())),
            scopes: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn set_variables(&self, ref_id: i64, variables: Vec<Variable>) -> DebugResult<()> {
        let mut vars = self.variables.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        vars.insert(ref_id, variables);
        Ok(())
    }

    pub fn get_variables(&self, ref_id: i64) -> DebugResult<Vec<Variable>> {
        let vars = self.variables.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(vars.get(&ref_id).cloned().unwrap_or_default())
    }

    pub fn set_scopes(&self, scopes: Vec<Scope>) -> DebugResult<()> {
        let mut scope_list = self.scopes.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        *scope_list = scopes;
        Ok(())
    }

    pub fn get_scopes(&self) -> DebugResult<Vec<Scope>> {
        let scopes = self.scopes.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(scopes.clone())
    }

    pub fn evaluate(&self, expression: &str) -> DebugResult<EvaluationResult> {
        // This would typically call the debug adapter
        // For now, return a placeholder result
        Ok(EvaluationResult::new(format!("<evaluated: {}>", expression)))
    }

    pub fn set_variable(&self, name: &str, value: &str) -> DebugResult<()> {
        // This would typically call the debug adapter
        Ok(())
    }

    pub fn clear(&self) -> DebugResult<()> {
        let mut vars = self.variables.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        let mut scopes = self.scopes.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        vars.clear();
        scopes.clear();
        Ok(())
    }
}

impl Default for VariableManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_variable() {
        let var = Variable::new("x", VariableValue::Number(42))
            .with_type("i32")
            .with_evaluate_name("x");

        assert_eq!(var.name, "x");
        assert_eq!(var.type_name, Some("i32".to_string()));
        assert_eq!(var.evaluate_name, Some("x".to_string()));
    }

    #[test]
    fn test_variable_value_display() {
        assert_eq!(VariableValue::Number(42).display(), "42");
        assert_eq!(VariableValue::String("test".to_string()).display(), "\"test\"");
        assert_eq!(VariableValue::Boolean(true).display(), "true");
        assert_eq!(VariableValue::Null.display(), "null");
    }

    #[test]
    fn test_variable_manager() {
        let manager = VariableManager::new();

        let vars = vec![
            Variable::new("x", VariableValue::Number(42)).with_type("i32"),
            Variable::new("y", VariableValue::Number(100)).with_type("i32"),
        ];

        manager.set_variables(100, vars).unwrap();
        let retrieved = manager.get_variables(100).unwrap();

        assert_eq!(retrieved.len(), 2);
        assert_eq!(retrieved[0].name, "x");
    }
}
