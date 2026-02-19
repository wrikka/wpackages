use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mock {
    pub id: String,
    pub name: String,
    pub mock_type: MockType,
    pub calls: Vec<MockCall>,
    pub expectations: Vec<MockExpectation>,
}

impl Mock {
    pub fn new(name: impl Into<String>, mock_type: MockType) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            mock_type,
            calls: Vec::new(),
            expectations: Vec::new(),
        }
    }

    pub fn expect(mut self, expectation: MockExpectation) -> Self {
        self.expectations.push(expectation);
        self
    }

    pub fn record_call(&mut self, call: MockCall) {
        self.calls.push(call);
    }

    pub fn verify(&self) -> MockVerification {
        let mut verified = true;
        let mut errors = Vec::new();

        for expectation in &self.expectations {
            let matching_calls: Vec<&MockCall> = self
                .calls
                .iter()
                .filter(|c| c.matches_expectation(expectation))
                .collect();

            match &expectation.times {
                ExpectedTimes::Exactly(n) => {
                    if matching_calls.len() != *n {
                        verified = false;
                        errors.push(format!(
                            "Expected {} calls to {}, got {}",
                            n,
                            expectation.method,
                            matching_calls.len()
                        ));
                    }
                }
                ExpectedTimes::AtLeast(n) => {
                    if matching_calls.len() < *n {
                        verified = false;
                        errors.push(format!(
                            "Expected at least {} calls to {}, got {}",
                            n,
                            expectation.method,
                            matching_calls.len()
                        ));
                    }
                }
                ExpectedTimes::AtMost(n) => {
                    if matching_calls.len() > *n {
                        verified = false;
                        errors.push(format!(
                            "Expected at most {} calls to {}, got {}",
                            n,
                            expectation.method,
                            matching_calls.len()
                        ));
                    }
                }
                ExpectedTimes::Never => {
                    if !matching_calls.is_empty() {
                        verified = false;
                        errors.push(format!(
                            "Expected no calls to {}, got {}",
                            expectation.method,
                            matching_calls.len()
                        ));
                    }
                }
            }
        }

        MockVerification {
            mock_name: self.name.clone(),
            verified,
            errors,
            total_calls: self.calls.len(),
            expected_calls: self.expectations.len(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MockType {
    Function,
    Method,
    Trait,
    Module,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockCall {
    pub method: String,
    pub args: Vec<MockValue>,
    pub result: Option<MockValue>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

impl MockCall {
    pub fn new(method: impl Into<String>, args: Vec<MockValue>) -> Self {
        Self {
            method: method.into(),
            args,
            result: None,
            timestamp: chrono::Utc::now(),
        }
    }

    pub fn with_result(mut self, result: MockValue) -> Self {
        self.result = Some(result);
        self
    }

    pub fn matches_expectation(&self, expectation: &MockExpectation) -> bool {
        if self.method != expectation.method {
            return false;
        }

        if expectation.args.is_empty() {
            return true;
        }

        self.args.len() == expectation.args.len()
            && self
                .args
                .iter()
                .zip(expectation.args.iter())
                .all(|(actual, expected)| actual.matches(expected))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockExpectation {
    pub method: String,
    pub args: Vec<MockValue>,
    pub return_value: Option<MockValue>,
    pub times: ExpectedTimes,
    pub in_order: bool,
}

impl MockExpectation {
    pub fn new(method: impl Into<String>) -> Self {
        Self {
            method: method.into(),
            args: Vec::new(),
            return_value: None,
            times: ExpectedTimes::Exactly(1),
            in_order: false,
        }
    }

    pub fn with_args(mut self, args: Vec<MockValue>) -> Self {
        self.args = args;
        self
    }

    pub fn with_return(mut self, value: MockValue) -> Self {
        self.return_value = Some(value);
        self
    }

    pub fn with_times(mut self, times: ExpectedTimes) -> Self {
        self.times = times;
        self
    }

    pub fn once() -> Self {
        Self::new("").with_times(ExpectedTimes::Exactly(1))
    }

    pub fn never() -> Self {
        Self::new("").with_times(ExpectedTimes::Never)
    }

    pub fn at_least(n: usize) -> Self {
        Self::new("").with_times(ExpectedTimes::AtLeast(n))
    }

    pub fn at_most(n: usize) -> Self {
        Self::new("").with_times(ExpectedTimes::AtMost(n))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExpectedTimes {
    Exactly(usize),
    AtLeast(usize),
    AtMost(usize),
    Never,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MockValue {
    Null,
    Bool(bool),
    Number(i64),
    Float(f64),
    String(String),
    Array(Vec<MockValue>),
    Object(HashMap<String, MockValue>),
    Any,
    Pattern(String),
}

impl MockValue {
    pub fn matches(&self, other: &Self) -> bool {
        match (self, other) {
            (Self::Any, _) => true,
            (_, Self::Any) => true,
            (Self::Pattern(pattern), other) => {
                let other_str = match other {
                    Self::String(s) => s.clone(),
                    _ => return false,
                };
                regex::Regex::new(pattern)
                    .map(|re| re.is_match(&other_str))
                    .unwrap_or(false)
            }
            (Self::Bool(a), Self::Bool(b)) => a == b,
            (Self::Number(a), Self::Number(b)) => a == b,
            (Self::Float(a), Self::Float(b)) => (a - b).abs() < f64::EPSILON,
            (Self::String(a), Self::String(b)) => a == b,
            (Self::Array(a), Self::Array(b)) => {
                a.len() == b.len() && a.iter().zip(b.iter()).all(|(x, y)| x.matches(y))
            }
            (Self::Object(a), Self::Object(b)) => {
                a.len() == b.len()
                    && a.iter()
                        .all(|(k, v)| b.get(k).map(|bv| v.matches(bv)).unwrap_or(false))
            }
            (Self::Null, Self::Null) => true,
            _ => false,
        }
    }
}

impl From<&str> for MockValue {
    fn from(value: &str) -> Self {
        Self::String(value.to_string())
    }
}

impl From<String> for MockValue {
    fn from(value: String) -> Self {
        Self::String(value)
    }
}

impl From<i64> for MockValue {
    fn from(value: i64) -> Self {
        Self::Number(value)
    }
}

impl From<bool> for MockValue {
    fn from(value: bool) -> Self {
        Self::Bool(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockVerification {
    pub mock_name: String,
    pub verified: bool,
    pub errors: Vec<String>,
    pub total_calls: usize,
    pub expected_calls: usize,
}

#[derive(Debug, Clone, Default)]
pub struct MockRegistry {
    mocks: HashMap<String, Mock>,
}

impl MockRegistry {
    pub fn new() -> Self {
        Self {
            mocks: HashMap::new(),
        }
    }

    pub fn register(&mut self, mock: Mock) {
        self.mocks.insert(mock.name.clone(), mock);
    }

    pub fn get(&self, name: &str) -> Option<&Mock> {
        self.mocks.get(name)
    }

    pub fn get_mut(&mut self, name: &str) -> Option<&mut Mock> {
        self.mocks.get_mut(name)
    }

    pub fn verify_all(&self) -> Vec<MockVerification> {
        self.mocks.values().map(|m| m.verify()).collect()
    }

    pub fn clear(&mut self) {
        self.mocks.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mock_creation() {
        let mock = Mock::new("db", MockType::Trait);
        assert_eq!(mock.name, "db");
    }

    #[test]
    fn test_mock_expectation() {
        let expectation = MockExpectation::new("query")
            .with_args(vec![MockValue::String("SELECT *".into())])
            .with_times(ExpectedTimes::Exactly(1));

        assert_eq!(expectation.method, "query");
    }

    #[test]
    fn test_mock_value_matching() {
        assert!(MockValue::Any.matches(&MockValue::String("test".into())));
        assert!(MockValue::String("test".into()).matches(&MockValue::String("test".into())));
        assert!(!MockValue::String("test".into()).matches(&MockValue::String("other".into())));
    }

    #[test]
    fn test_mock_verification() {
        let mut mock = Mock::new("service", MockType::Trait);
        mock = mock.expect(MockExpectation::new("call").with_times(ExpectedTimes::Exactly(1)));
        mock.record_call(MockCall::new("call", vec![]));

        let verification = mock.verify();
        assert!(verification.verified);
    }
}
