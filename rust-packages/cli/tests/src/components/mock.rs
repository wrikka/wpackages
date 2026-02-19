use crate::error::{TestingError, TestingResult};
use crate::types::{Mock, MockCall, MockExpectation, MockRegistry, MockType, MockValue, MockVerification, ExpectedTimes};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tracing::{debug, info};

pub struct MockController {
    registry: Arc<Mutex<MockRegistry>>,
}

impl MockController {
    pub fn new() -> Self {
        Self {
            registry: Arc::new(Mutex::new(MockRegistry::new())),
        }
    }

    pub fn create(&self, name: &str, mock_type: MockType) -> MockBuilder {
        MockBuilder::new(name, mock_type, self.registry.clone())
    }

    pub fn get(&self, name: &str) -> Option<Mock> {
        self.registry.lock().unwrap().get(name).cloned()
    }

    pub fn record_call(&self, name: &str, method: &str, args: Vec<MockValue>) {
        let mut registry = self.registry.lock().unwrap();
        if let Some(mock) = registry.get_mut(name) {
            mock.record_call(MockCall::new(method, args));
            debug!("Recorded call to {}.{}", name, method);
        }
    }

    pub fn record_call_with_result(&self, name: &str, method: &str, args: Vec<MockValue>, result: MockValue) {
        let mut registry = self.registry.lock().unwrap();
        if let Some(mock) = registry.get_mut(name) {
            let call = MockCall::new(method, args).with_result(result);
            mock.record_call(call);
        }
    }

    pub fn verify(&self, name: &str) -> Option<MockVerification> {
        self.registry.lock().unwrap().get(name).map(|m| m.verify())
    }

    pub fn verify_all(&self) -> Vec<MockVerification> {
        self.registry.lock().unwrap().verify_all()
    }

    pub fn clear(&self) {
        self.registry.lock().unwrap().clear();
    }

    pub fn reset(&self, name: &str) {
        let mut registry = self.registry.lock().unwrap();
        if let Some(mock) = registry.get_mut(name) {
            mock.calls.clear();
        }
    }
}

impl Default for MockController {
    fn default() -> Self {
        Self::new()
    }
}

pub struct MockBuilder {
    name: String,
    mock_type: MockType,
    expectations: Vec<MockExpectation>,
    registry: Arc<Mutex<MockRegistry>>,
}

impl MockBuilder {
    pub fn new(name: &str, mock_type: MockType, registry: Arc<Mutex<MockRegistry>>) -> Self {
        Self {
            name: name.to_string(),
            mock_type,
            expectations: Vec::new(),
            registry,
        }
    }

    pub fn expect(mut self, method: &str) -> Self {
        self.expectations.push(MockExpectation::new(method));
        self
    }

    pub fn with_args(mut self, args: Vec<MockValue>) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.args = args;
        }
        self
    }

    pub fn returns(mut self, value: MockValue) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.return_value = Some(value);
        }
        self
    }

    pub fn times(mut self, times: usize) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.times = ExpectedTimes::Exactly(times);
        }
        self
    }

    pub fn once(mut self) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.times = ExpectedTimes::Exactly(1);
        }
        self
    }

    pub fn never(mut self) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.times = ExpectedTimes::Never;
        }
        self
    }

    pub fn at_least(mut self, n: usize) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.times = ExpectedTimes::AtLeast(n);
        }
        self
    }

    pub fn at_most(mut self, n: usize) -> Self {
        if let Some(last) = self.expectations.last_mut() {
            last.times = ExpectedTimes::AtMost(n);
        }
        self
    }

    pub fn build(self) -> String {
        let mut mock = Mock::new(&self.name, self.mock_type);
        for expectation in self.expectations {
            mock = mock.expect(expectation);
        }

        let name = mock.name.clone();
        self.registry.lock().unwrap().register(mock);
        name
    }
}

pub fn mock_fn() -> MockFnBuilder {
    MockFnBuilder::new()
}

pub struct MockFnBuilder {
    return_values: Vec<MockValue>,
    calls: usize,
}

impl MockFnBuilder {
    pub fn new() -> Self {
        Self {
            return_values: Vec::new(),
            calls: 0,
        }
    }

    pub fn returns(mut self, value: impl Into<MockValue>) -> Self {
        self.return_values.push(value.into());
        self
    }

    pub fn returns_sequence(mut self, values: Vec<MockValue>) -> Self {
        self.return_values = values;
        self
    }

    pub fn build(self) -> Box<dyn Fn() -> MockValue + Send + Sync> {
        let return_values = Arc::new(Mutex::new(self.return_values));
        let calls = Arc::new(Mutex::new(0usize));

        Box::new(move || {
            let mut calls = calls.lock().unwrap();
            let mut values = return_values.lock().unwrap();
            *calls += 1;

            if !values.is_empty() {
                values.remove(0)
            } else {
                MockValue::Null
            }
        })
    }
}

impl Default for MockFnBuilder {
    fn default() -> Self {
        Self::new()
    }
}

pub fn when<F, R>(condition: F) -> WhenBuilder<F>
where
    F: Fn() -> bool + Send + Sync + 'static,
{
    WhenBuilder::new(condition)
}

pub struct WhenBuilder<F> {
    condition: F,
    return_value: Option<MockValue>,
}

impl<F> WhenBuilder<F>
where
    F: Fn() -> bool + Send + Sync + 'static,
{
    pub fn new(condition: F) -> Self {
        Self {
            condition,
            return_value: None,
        }
    }

    pub fn returns(mut self, value: impl Into<MockValue>) -> Self {
        self.return_value = Some(value.into());
        self
    }

    pub fn build(self) -> Box<dyn Fn() -> Option<MockValue> + Send + Sync> {
        let condition = self.condition;
        let return_value = self.return_value;

        Box::new(move || {
            if condition() {
                return_value.clone()
            } else {
                None
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mock_controller() {
        let controller = MockController::new();

        let mock_name = controller
            .create("db", MockType::Trait)
            .expect("query")
            .returns(MockValue::String("result".into()))
            .once()
            .build();

        controller.record_call(&mock_name, "query", vec![]);

        let verification = controller.verify(&mock_name).unwrap();
        assert!(verification.verified);
    }

    #[test]
    fn test_mock_verification_failure() {
        let controller = MockController::new();

        let mock_name = controller
            .create("service", MockType::Trait)
            .expect("call")
            .times(2)
            .build();

        controller.record_call(&mock_name, "call", vec![]);

        let verification = controller.verify(&mock_name).unwrap();
        assert!(!verification.verified);
    }

    #[test]
    fn test_mock_fn() {
        let mock = mock_fn()
            .returns(MockValue::Number(1))
            .returns(MockValue::Number(2))
            .build();

        assert_eq!(mock(), MockValue::Number(1));
        assert_eq!(mock(), MockValue::Number(2));
    }

    #[test]
    fn test_mock_value_matching() {
        assert!(MockValue::Any.matches(&MockValue::Number(42)));
        assert!(MockValue::Number(42).matches(&MockValue::Number(42)));
        assert!(!MockValue::Number(42).matches(&MockValue::Number(43)));
    }
}
