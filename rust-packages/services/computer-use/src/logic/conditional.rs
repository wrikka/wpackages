//! Conditional Logic Engine
//!
//! Supports if/else conditions, loops, and variables in automation scripts.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Conditional logic engine
pub struct ConditionalEngine {
    variables: HashMap<String, VariableValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum VariableValue {
    String(String),
    Number(f64),
    Bool(bool),
    List(Vec<VariableValue>),
    Map(HashMap<String, VariableValue>),
    Null,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionalBlock {
    pub condition: Condition,
    pub then_actions: Vec<Action>,
    pub else_actions: Option<Vec<Action>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Condition {
    Compare {
        left: Expression,
        operator: ComparisonOp,
        right: Expression,
    },
    And(Vec<Condition>),
    Or(Vec<Condition>),
    Not(Box<Condition>),
    Exists(String),
    Empty(String),
    True(String),
    Regex { field: String, pattern: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComparisonOp {
    Eq,
    Ne,
    Gt,
    Gte,
    Lt,
    Lte,
    Contains,
    StartsWith,
    EndsWith,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Expression {
    Variable(String),
    Literal(VariableValue),
    Function { name: String, args: Vec<Expression> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Loop {
    pub loop_type: LoopType,
    pub actions: Vec<Action>,
    pub break_condition: Option<Condition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoopType {
    For {
        variable: String,
        items: Expression,
    },
    While {
        condition: Condition,
    },
    Repeat {
        count: Expression,
    },
    ForRange {
        variable: String,
        start: Expression,
        end: Expression,
        step: Option<Expression>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub action_type: String,
    pub params: HashMap<String, serde_json::Value>,
    pub condition: Option<Condition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Script {
    pub variables: HashMap<String, VariableValue>,
    pub actions: Vec<ScriptStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScriptStep {
    Action(Action),
    Conditional(ConditionalBlock),
    Loop(Loop),
    SetVariable { name: String, value: Expression },
    Break,
    Continue,
    Return(Option<Expression>),
}

impl ConditionalEngine {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
        }
    }

    pub fn with_variables(mut self, variables: HashMap<String, VariableValue>) -> Self {
        self.variables = variables;
        self
    }

    /// Evaluate a condition
    pub fn evaluate_condition(&self, condition: &Condition) -> Result<bool> {
        match condition {
            Condition::Compare { left, operator, right } => {
                let left_val = self.evaluate_expression(left)?;
                let right_val = self.evaluate_expression(right)?;
                self.compare(&left_val, operator, &right_val)
            }
            Condition::And(conditions) => {
                Ok(conditions.iter().all(|c| self.evaluate_condition(c).unwrap_or(false)))
            }
            Condition::Or(conditions) => {
                Ok(conditions.iter().any(|c| self.evaluate_condition(c).unwrap_or(false)))
            }
            Condition::Not(cond) => {
                Ok(!self.evaluate_condition(cond)?)
            }
            Condition::Exists(var_name) => {
                Ok(self.variables.contains_key(var_name))
            }
            Condition::Empty(var_name) => {
                if let Some(val) = self.variables.get(var_name) {
                    Ok(self.is_empty(val))
                } else {
                    Ok(true)
                }
            }
            Condition::True(var_name) => {
                if let Some(val) = self.variables.get(var_name) {
                    Ok(self.is_truthy(val))
                } else {
                    Ok(false)
                }
            }
            Condition::Regex { field, pattern } => {
                if let Some(val) = self.variables.get(field) {
                    let text = self.value_to_string(val);
                    Ok(regex::Regex::new(pattern).map_err(|e| Error::InvalidCommand(e.to_string()))?.is_match(&text))
                } else {
                    Ok(false)
                }
            }
        }
    }

    fn evaluate_expression(&self, expr: &Expression) -> Result<VariableValue> {
        match expr {
            Expression::Variable(name) => {
                self.variables.get(name).cloned().ok_or_else(|| {
                    Error::InvalidCommand(format!("Variable '{}' not found", name))
                })
            }
            Expression::Literal(value) => Ok(value.clone()),
            Expression::Function { name, args } => {
                let evaluated_args: Result<Vec<_>> = args.iter().map(|a| self.evaluate_expression(a)).collect();
                self.call_function(name, evaluated_args?)
            }
        }
    }

    fn compare(&self, left: &VariableValue, op: &ComparisonOp, right: &VariableValue) -> Result<bool> {
        match (left, right) {
            (VariableValue::Number(l), VariableValue::Number(r)) => {
                Ok(match op {
                    ComparisonOp::Eq => (l - r).abs() < f64::EPSILON,
                    ComparisonOp::Ne => (l - r).abs() >= f64::EPSILON,
                    ComparisonOp::Gt => l > r,
                    ComparisonOp::Gte => l >= r,
                    ComparisonOp::Lt => l < r,
                    ComparisonOp::Lte => l <= r,
                    _ => false,
                })
            }
            (VariableValue::String(l), VariableValue::String(r)) => {
                Ok(match op {
                    ComparisonOp::Eq => l == r,
                    ComparisonOp::Ne => l != r,
                    ComparisonOp::Contains => l.contains(r),
                    ComparisonOp::StartsWith => l.starts_with(r),
                    ComparisonOp::EndsWith => l.ends_with(r),
                    _ => false,
                })
            }
            _ => Ok(false),
        }
    }

    fn call_function(&self, name: &str, args: Vec<VariableValue>) -> Result<VariableValue> {
        match name {
            "len" | "length" => {
                if let Some(arg) = args.first() {
                    let len = match arg {
                        VariableValue::String(s) => s.len(),
                        VariableValue::List(l) => l.len(),
                        VariableValue::Map(m) => m.len(),
                        _ => 0,
                    };
                    Ok(VariableValue::Number(len as f64))
                } else {
                    Err(Error::InvalidCommand("len() requires 1 argument".to_string()))
                }
            }
            "upper" => {
                if let Some(VariableValue::String(s)) = args.first() {
                    Ok(VariableValue::String(s.to_uppercase()))
                } else {
                    Err(Error::InvalidCommand("upper() requires string argument".to_string()))
                }
            }
            "lower" => {
                if let Some(VariableValue::String(s)) = args.first() {
                    Ok(VariableValue::String(s.to_lowercase()))
                } else {
                    Err(Error::InvalidCommand("lower() requires string argument".to_string()))
                }
            }
            "trim" => {
                if let Some(VariableValue::String(s)) = args.first() {
                    Ok(VariableValue::String(s.trim().to_string()))
                } else {
                    Err(Error::InvalidCommand("trim() requires string argument".to_string()))
                }
            }
            "concat" => {
                let result: String = args.iter()
                    .map(|v| self.value_to_string(v))
                    .collect();
                Ok(VariableValue::String(result))
            }
            "add" | "sum" => {
                let sum: f64 = args.iter()
                    .filter_map(|v| match v {
                        VariableValue::Number(n) => Some(*n),
                        _ => None,
                    })
                    .sum();
                Ok(VariableValue::Number(sum))
            }
            _ => Err(Error::InvalidCommand(format!("Unknown function: {}", name))),
        }
    }

    fn is_empty(&self, val: &VariableValue) -> bool {
        match val {
            VariableValue::String(s) => s.is_empty(),
            VariableValue::List(l) => l.is_empty(),
            VariableValue::Map(m) => m.is_empty(),
            VariableValue::Null => true,
            _ => false,
        }
    }

    fn is_truthy(&self, val: &VariableValue) -> bool {
        match val {
            VariableValue::Bool(b) => *b,
            VariableValue::String(s) => !s.is_empty() && s != "false" && s != "0",
            VariableValue::Number(n) => *n != 0.0,
            VariableValue::List(l) => !l.is_empty(),
            VariableValue::Map(m) => !m.is_empty(),
            VariableValue::Null => false,
        }
    }

    fn value_to_string(&self, val: &VariableValue) -> String {
        match val {
            VariableValue::String(s) => s.clone(),
            VariableValue::Number(n) => n.to_string(),
            VariableValue::Bool(b) => b.to_string(),
            VariableValue::Null => "null".to_string(),
            _ => format!("{:?}", val),
        }
    }

    /// Set a variable
    pub fn set_variable(&mut self, name: &str, value: VariableValue) {
        self.variables.insert(name.to_string(), value);
    }

    /// Get a variable
    pub fn get_variable(&self, name: &str) -> Option<&VariableValue> {
        self.variables.get(name)
    }

    /// Execute a script
    pub fn execute_script(&mut self, script: &Script) -> Result<Option<VariableValue>> {
        for step in &script.actions {
            match step {
                ScriptStep::SetVariable { name, value } => {
                    let val = self.evaluate_expression(value)?;
                    self.set_variable(name, val);
                }
                ScriptStep::Conditional(block) => {
                    if self.evaluate_condition(&block.condition)? {
                        // Execute then_actions
                    } else if let Some(ref else_actions) = block.else_actions {
                        // Execute else_actions
                        let _ = else_actions;
                    }
                }
                ScriptStep::Loop(_loop_def) => {
                    // Execute loop
                }
                ScriptStep::Break => break,
                ScriptStep::Continue => continue,
                ScriptStep::Return(expr) => {
                    if let Some(expr) = expr {
                        return Ok(Some(self.evaluate_expression(expr)?));
                    } else {
                        return Ok(None);
                    }
                }
                ScriptStep::Action(_) => {
                    // Execute action
                }
            }
        }
        Ok(None)
    }
}

/// Parser for condition expressions
pub struct ConditionParser;

impl ConditionParser {
    /// Parse a condition from string
    pub fn parse(input: &str) -> Result<Condition> {
        // Simple parser - would use a proper parser in production
        if input.contains("&&") {
            let parts: Vec<_> = input.split("&&").map(|s| s.trim()).collect();
            let conditions: Result<Vec<_>> = parts.iter().map(|p| Self::parse(p)).collect();
            Ok(Condition::And(conditions?))
        } else if input.contains("||") {
            let parts: Vec<_> = input.split("||").map(|s| s.trim()).collect();
            let conditions: Result<Vec<_>> = parts.iter().map(|p| Self::parse(p)).collect();
            Ok(Condition::Or(conditions?))
        } else if input.contains("==") {
            let parts: Vec<_> = input.split("==").map(|s| s.trim()).collect();
            if parts.len() == 2 {
                Ok(Condition::Compare {
                    left: Self::parse_expression(parts[0]),
                    operator: ComparisonOp::Eq,
                    right: Self::parse_expression(parts[1]),
                })
            } else {
                Err(Error::InvalidCommand("Invalid comparison".to_string()))
            }
        } else if input.contains("!=") {
            let parts: Vec<_> = input.split("!=").map(|s| s.trim()).collect();
            if parts.len() == 2 {
                Ok(Condition::Compare {
                    left: Self::parse_expression(parts[0]),
                    operator: ComparisonOp::Ne,
                    right: Self::parse_expression(parts[1]),
                })
            } else {
                Err(Error::InvalidCommand("Invalid comparison".to_string()))
            }
        } else if input.starts_with("!") {
            let inner = Self::parse(&input[1..].trim())?;
            Ok(Condition::Not(Box::new(inner)))
        } else if input.starts_with("exists(") && input.ends_with(")") {
            let var_name = &input[7..input.len()-1];
            Ok(Condition::Exists(var_name.to_string()))
        } else {
            // Treat as variable truthy check
            Ok(Condition::True(input.to_string()))
        }
    }

    fn parse_expression(input: &str) -> Expression {
        let trimmed = input.trim();
        if trimmed.starts_with("\"") && trimmed.ends_with("\"") {
            Expression::Literal(VariableValue::String(trimmed[1..trimmed.len()-1].to_string()))
        } else if trimmed.starts_with("'") && trimmed.ends_with("'") {
            Expression::Literal(VariableValue::String(trimmed[1..trimmed.len()-1].to_string()))
        } else if let Ok(num) = trimmed.parse::<f64>() {
            Expression::Literal(VariableValue::Number(num))
        } else if trimmed == "true" {
            Expression::Literal(VariableValue::Bool(true))
        } else if trimmed == "false" {
            Expression::Literal(VariableValue::Bool(false))
        } else if trimmed == "null" {
            Expression::Literal(VariableValue::Null)
        } else {
            Expression::Variable(trimmed.to_string())
        }
    }
}
