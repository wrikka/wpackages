use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FilterOperator {
    And,
    Or,
    Not,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterCondition {
    Tag { tag: String, negate: bool },
    Priority { min_priority: String, negate: bool },
    Name { pattern: String, negate: bool },
    File { pattern: String, negate: bool },
    Slow { negate: bool },
    Flaky { negate: bool },
    Skipped { negate: bool },
}

impl FilterCondition {
    pub fn has_tag(tag: impl Into<String>) -> Self {
        Self::Tag {
            tag: tag.into(),
            negate: false,
        }
    }

    pub fn not_tag(tag: impl Into<String>) -> Self {
        Self::Tag {
            tag: tag.into(),
            negate: true,
        }
    }

    pub fn name_matches(pattern: impl Into<String>) -> Self {
        Self::Name {
            pattern: pattern.into(),
            negate: false,
        }
    }

    pub fn not_name(pattern: impl Into<String>) -> Self {
        Self::Name {
            pattern: pattern.into(),
            negate: true,
        }
    }

    pub fn file_matches(pattern: impl Into<String>) -> Self {
        Self::File {
            pattern: pattern.into(),
            negate: false,
        }
    }

    pub fn is_slow() -> Self {
        Self::Slow { negate: false }
    }

    pub fn is_flaky() -> Self {
        Self::Flaky { negate: false }
    }

    pub fn is_skipped() -> Self {
        Self::Skipped { negate: false }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterExpression {
    pub operator: FilterOperator,
    pub conditions: Vec<FilterCondition>,
    pub sub_expressions: Vec<FilterExpression>,
}

impl FilterExpression {
    pub fn single(condition: FilterCondition) -> Self {
        Self {
            operator: FilterOperator::And,
            conditions: vec![condition],
            sub_expressions: Vec::new(),
        }
    }

    pub fn and(conditions: Vec<FilterCondition>) -> Self {
        Self {
            operator: FilterOperator::And,
            conditions,
            sub_expressions: Vec::new(),
        }
    }

    pub fn or(conditions: Vec<FilterCondition>) -> Self {
        Self {
            operator: FilterOperator::Or,
            conditions,
            sub_expressions: Vec::new(),
        }
    }

    pub fn not(condition: FilterCondition) -> Self {
        Self {
            operator: FilterOperator::Not,
            conditions: vec![condition],
            sub_expressions: Vec::new(),
        }
    }

    pub fn with_sub_expression(mut self, expr: FilterExpression) -> Self {
        self.sub_expressions.push(expr);
        self
    }
}

#[derive(Debug, Clone, Default)]
pub struct FilterDsl {
    expression: Option<FilterExpression>,
}

impl FilterDsl {
    pub fn new() -> Self {
        Self { expression: None }
    }

    pub fn with_expression(mut self, expr: FilterExpression) -> Self {
        self.expression = Some(expr);
        self
    }

    pub fn parse(query: &str) -> Result<Self, FilterParseError> {
        let tokens = tokenize(query)?;
        let expression = parse_expression(&tokens)?;
        Ok(Self {
            expression: Some(expression),
        })
    }

    pub fn expression(&self) -> Option<&FilterExpression> {
        self.expression.as_ref()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum FilterToken {
    Tag(String),
    NotTag(String),
    Name(String),
    NotName(String),
    File(String),
    Slow,
    Flaky,
    Skipped,
    And,
    Or,
    Not,
    LParen,
    RParen,
}

#[derive(Debug, Clone)]
pub struct FilterParseError {
    pub message: String,
    pub position: usize,
}

impl FilterParseError {
    pub fn new(message: impl Into<String>, position: usize) -> Self {
        Self {
            message: message.into(),
            position,
        }
    }
}

impl std::fmt::Display for FilterParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Parse error at position {}: {}", self.position, self.message)
    }
}

impl std::error::Error for FilterParseError {}

fn tokenize(query: &str) -> Result<Vec<FilterToken>, FilterParseError> {
    let mut tokens = Vec::new();
    let mut chars = query.char_indices().peekable();

    while let Some((idx, ch)) = chars.next() {
        match ch {
            ' ' | '\t' => continue,
            '@' => {
                let mut tag = String::new();
                while let Some((_, c)) = chars.peek() {
                    if c.is_alphanumeric() || *c == '_' || *c == '-' {
                        tag.push(*c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                if tag.starts_with('!') {
                    tokens.push(FilterToken::NotTag(tag[1..].to_string()));
                } else {
                    tokens.push(FilterToken::Tag(tag));
                }
            }
            '"' => {
                let mut name = String::new();
                while let Some((_, c)) = chars.peek() {
                    if *c == '"' {
                        chars.next();
                        break;
                    }
                    name.push(*c);
                    chars.next();
                }
                if name.starts_with('!') {
                    tokens.push(FilterToken::NotName(name[1..].to_string()));
                } else {
                    tokens.push(FilterToken::Name(name));
                }
            }
            '(' => tokens.push(FilterToken::LParen),
            ')' => tokens.push(FilterToken::RParen),
            '&' => {
                if chars.peek().map(|(_, c)| *c) == Some('&') {
                    chars.next();
                    tokens.push(FilterToken::And);
                }
            }
            '|' => {
                if chars.peek().map(|(_, c)| *c) == Some('|') {
                    chars.next();
                    tokens.push(FilterToken::Or);
                }
            }
            '!' => {
                if chars.peek().map(|(_, c)| *c) == Some('(') {
                    chars.next();
                    tokens.push(FilterToken::Not);
                    tokens.push(FilterToken::LParen);
                }
            }
            _ => {
                let mut word = String::new();
                word.push(ch);
                while let Some((_, c)) = chars.peek() {
                    if c.is_alphanumeric() || *c == '_' {
                        word.push(*c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                match word.as_str() {
                    "and" | "AND" => tokens.push(FilterToken::And),
                    "or" | "OR" => tokens.push(FilterToken::Or),
                    "not" | "NOT" => tokens.push(FilterToken::Not),
                    "slow" | "SLOW" => tokens.push(FilterToken::Slow),
                    "flaky" | "FLAKY" => tokens.push(FilterToken::Flaky),
                    "skipped" | "SKIPPED" => tokens.push(FilterToken::Skipped),
                    _ => {
                        return Err(FilterParseError::new(
                            format!("Unknown token: {}", word),
                            idx,
                        ))
                    }
                }
            }
        }
    }

    Ok(tokens)
}

fn parse_expression(tokens: &[FilterToken]) -> Result<FilterExpression, FilterParseError> {
    if tokens.is_empty() {
        return Ok(FilterExpression::and(vec![]));
    }

    let mut conditions = Vec::new();
    let mut sub_expressions = Vec::new();
    let mut current_op = FilterOperator::And;
    let mut i = 0;

    while i < tokens.len() {
        match &tokens[i] {
            FilterToken::Tag(tag) => {
                conditions.push(FilterCondition::has_tag(tag));
            }
            FilterToken::NotTag(tag) => {
                conditions.push(FilterCondition::not_tag(tag));
            }
            FilterToken::Name(name) => {
                conditions.push(FilterCondition::name_matches(name));
            }
            FilterToken::NotName(name) => {
                conditions.push(FilterCondition::not_name(name));
            }
            FilterToken::Slow => {
                conditions.push(FilterCondition::is_slow());
            }
            FilterToken::Flaky => {
                conditions.push(FilterCondition::is_flaky());
            }
            FilterToken::Skipped => {
                conditions.push(FilterCondition::is_skipped());
            }
            FilterToken::And => {
                current_op = FilterOperator::And;
            }
            FilterToken::Or => {
                current_op = FilterOperator::Or;
            }
            FilterToken::Not => {
                i += 1;
                if i < tokens.len() && matches!(tokens[i], FilterToken::LParen) {
                    let (expr, consumed) = parse_parenthesized(tokens, i)?;
                    sub_expressions.push(FilterExpression::not(expr.conditions.into_iter().next().unwrap()));
                    i += consumed;
                }
            }
            FilterToken::LParen => {
                let (expr, consumed) = parse_parenthesized(tokens, i)?;
                sub_expressions.push(expr);
                i += consumed;
            }
            FilterToken::RParen => {}
            FilterToken::File(_) => {}
        }
        i += 1;
    }

    Ok(FilterExpression {
        operator: current_op,
        conditions,
        sub_expressions,
    })
}

fn parse_parenthesized(tokens: &[FilterToken], start: usize) -> Result<(FilterExpression, usize), FilterParseError> {
    let mut depth = 1;
    let mut end = start + 1;

    while end < tokens.len() && depth > 0 {
        match tokens[end] {
            FilterToken::LParen => depth += 1,
            FilterToken::RParen => depth -= 1,
            _ => {}
        }
        end += 1;
    }

    let inner = &tokens[start + 1..end - 1];
    let expr = parse_expression(inner)?;
    Ok((expr, end - start - 1))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_filter_condition_creation() {
        let cond = FilterCondition::has_tag("unit");
        match cond {
            FilterCondition::Tag { tag, negate } => {
                assert_eq!(tag, "unit");
                assert!(!negate);
            }
            _ => panic!("Wrong condition type"),
        }
    }

    #[test]
    fn test_filter_expression_and() {
        let expr = FilterExpression::and(vec![
            FilterCondition::has_tag("unit"),
            FilterCondition::is_slow(),
        ]);
        assert_eq!(expr.operator, FilterOperator::And);
        assert_eq!(expr.conditions.len(), 2);
    }

    #[test]
    fn test_tokenize_tag() {
        let tokens = tokenize("@unit").unwrap();
        assert_eq!(tokens.len(), 1);
        assert!(matches!(tokens[0], FilterToken::Tag(ref t) if t == "unit"));
    }

    #[test]
    fn test_parse_simple() {
        let dsl = FilterDsl::parse("@unit").unwrap();
        assert!(dsl.expression.is_some());
    }

    #[test]
    fn test_parse_complex() {
        let dsl = FilterDsl::parse("@unit && @slow").unwrap();
        assert!(dsl.expression.is_some());
    }
}
