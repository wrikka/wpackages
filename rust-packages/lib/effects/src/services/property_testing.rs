//! Property-based testing support (requires `property-testing` feature)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Property-based test configuration
#[derive(Debug, Clone)]
pub struct PropertyTestConfig {
    pub test_count: usize,
    pub shrink: bool,
    pub max_shrink_iterations: usize,
}

impl Default for PropertyTestConfig {
    fn default() -> Self {
        Self {
            test_count: 100,
            shrink: true,
            max_shrink_iterations: 100,
        }
    }
}

/// Arbitrary value generator for property testing
pub trait Arbitrary: Sized {
    fn arbitrary() -> Self;
    fn shrink(&self) -> Vec<Self>;
}

/// Implement Arbitrary for common types (requires `property-testing` feature)
#[cfg(feature = "property-testing")]
impl Arbitrary for i32 {
    fn arbitrary() -> Self {
        rand::random::<i32>()
    }

    fn shrink(&self) -> Vec<Self> {
        if *self == 0 {
            vec![]
        } else {
            vec![0, self / 2, self - 1]
        }
    }
}

#[cfg(feature = "property-testing")]
impl Arbitrary for String {
    fn arbitrary() -> Self {
        let len = rand::random::<usize>() % 20;
        (0..len)
            .map(|_| (rand::random::<u8>() % 26 + 97) as char)
            .collect()
    }

    fn shrink(&self) -> Vec<Self> {
        if self.is_empty() {
            vec![]
        } else {
            vec![self[..self.len() / 2].to_string()]
        }
    }
}

/// Property test result
#[derive(Debug, Clone)]
pub enum PropertyTestResult {
    Passed,
    Failed { input: String, error: String, shrunk: Vec<String> },
}

/// Property-based testing extension
pub trait PropertyTestExt<T, E, R>
where
    R: Arbitrary + Clone + Send + 'static,
{
    /// Test that a property holds for all generated inputs
    fn property_test<F>(
        self,
        property: F,
        config: PropertyTestConfig,
    ) -> Effect<PropertyTestResult, E, ()>
    where
        F: Fn(&R, &Result<T, E>) -> bool + Send + Sync + 'static;
}

#[cfg(feature = "property-testing")]
impl<T, E, R> PropertyTestExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Arbitrary + Clone + Send + 'static,
{
    fn property_test<F>(
        self,
        property: F,
        config: PropertyTestConfig,
    ) -> Effect<PropertyTestResult, E, ()>
    where
        F: Fn(&R, &Result<T, E>) -> bool + Send + Sync + 'static,
    {
        Effect::new(move |_| {
            let effect = self.clone();
            let property = Arc::new(Mutex::new(property));
            let config = config.clone();

            Box::pin(async move {
                for _ in 0..config.test_count {
                    let input = R::arbitrary();
                    let result = effect.clone().run(input.clone()).await;

                    let prop = property.lock().await;
                    if !prop(&input, &result) {
                        // Property failed
                        let mut shrunk = Vec::new();

                        if config.shrink {
                            // Try to find minimal failing input
                            for shrunk_input in input.shrink() {
                                let shrunk_result = effect.clone().run(shrunk_input.clone()).await;
                                if !prop(&shrunk_input, &shrunk_result) {
                                    shrunk.push(format!("{:?}", shrunk_input));
                                }
                            }
                        }

                        return Ok(PropertyTestResult::Failed {
                            input: format!("{:?}", input),
                            error: result.map_err(|e| e.to_string()).unwrap_or_default(),
                            shrunk,
                        });
                    }
                }

                Ok(PropertyTestResult::Passed)
            })
        })
    }
}

/// Fuzz test configuration
#[derive(Debug, Clone)]
pub struct FuzzConfig {
    pub iterations: usize,
    pub max_input_size: usize,
}

impl Default for FuzzConfig {
    fn default() -> Self {
        Self {
            iterations: 1000,
            max_input_size: 1024,
        }
    }
}

/// Fuzz testing extension
pub trait FuzzTestExt<T, E, R> {
    /// Fuzz test the effect with random inputs
    fn fuzz_test(self, config: FuzzConfig) -> Effect<Vec<Result<T, E>>, E, ()>;
}

#[cfg(feature = "property-testing")]
impl<T, E, R> FuzzTestExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Arbitrary + Clone + Send + 'static,
{
    fn fuzz_test(self, config: FuzzConfig) -> Effect<Vec<Result<T, E>>, E, ()> {
        Effect::new(move |_| {
            let effect = self.clone();
            let config = config.clone();

            Box::pin(async move {
                let mut results = Vec::new();

                for _ in 0..config.iterations {
                    let input = R::arbitrary();
                    let result = effect.clone().run(input).await;
                    results.push(result);
                }

                Ok(results)
            })
        })
    }
}

#[cfg(all(test, feature = "property-testing"))]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_property_test_pass() {
        let effect = Effect::<i32, EffectError, i32>::new(|ctx: i32| {
            Box::pin(async move { Ok(ctx * 2) })
        });

        let config = PropertyTestConfig {
            test_count: 10,
            shrink: false,
            ..Default::default()
        };

        let test_effect = effect.property_test(
            |_input: &i32, result: &Result<i32, EffectError>| {
                if let Ok(val) = result {
                    *val % 2 == 0 // All results should be even
                } else {
                    false
                }
            },
            config,
        );

        let result = test_effect.run(()).await;
        assert!(matches!(result.unwrap(), PropertyTestResult::Passed));
    }
}
