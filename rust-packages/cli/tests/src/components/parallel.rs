use crate::error::{TestingError, TestingResult};
use crate::types::{TestCase, TestCaseId, TestConfig, TestExecutionResult, TestResult, TestSuite, TestSuiteResult};
use crossbeam::channel::{self, Receiver, Sender};
use parking_lot::Mutex;
use rayon::prelude::*;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub enum ParallelMessage {
    TestStarted(TestCaseId),
    TestCompleted(TestExecutionResult),
    Progress { completed: usize, total: usize },
    Error(String),
}

pub struct ParallelExecutor {
    config: TestConfig,
    running: Arc<Mutex<bool>>,
    cancel_flag: Arc<Mutex<bool>>,
    progress: Arc<Mutex<ParallelProgress>>,
}

#[derive(Debug, Clone, Default)]
pub struct ParallelProgress {
    pub total: usize,
    pub completed: usize,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
}

impl ParallelExecutor {
    pub fn new(config: &TestConfig) -> Self {
        Self {
            config: config.clone(),
            running: Arc::new(Mutex::new(false)),
            cancel_flag: Arc::new(Mutex::new(false)),
            progress: Arc::new(Mutex::new(ParallelProgress::default())),
        }
    }

    pub fn is_running(&self) -> bool {
        *self.running.lock()
    }

    pub fn cancel(&self) {
        *self.cancel_flag.lock() = true;
    }

    pub fn progress(&self) -> ParallelProgress {
        self.progress.lock().clone()
    }

    pub fn execute_parallel<F>(
        &self,
        tests: Vec<TestCase>,
        executor: F,
    ) -> TestingResult<Vec<TestExecutionResult>>
    where
        F: Fn(&TestCase) -> TestingResult<TestExecutionResult> + Send + Sync,
    {
        let executor = Arc::new(executor);
        let total = tests.len();
        let results = Arc::new(Mutex::new(Vec::with_capacity(total)));
        let running = self.running.clone();
        let cancel_flag = self.cancel_flag.clone();
        let progress = self.progress.clone();

        *running.lock() = true;
        *cancel_flag.lock() = false;
        *progress.lock() = ParallelProgress { total, ..Default::default() };

        let start = Instant::now();

        if self.config.parallel && total > 1 {
            let max_concurrent = self.config.max_concurrent.min(num_cpus::get());
            
            let pool = rayon::ThreadPoolBuilder::new()
                .num_threads(max_concurrent)
                .build()
                .map_err(|e| TestingError::Other(e.into()))?;

            pool.install(|| {
                tests.into_par_iter()
                    .with_max_len(1)
                    .try_for_each(|test| {
                        if *cancel_flag.lock() {
                            return Ok(());
                        }

                        let result = executor(&test)?;

                        {
                            let mut prog = progress.lock();
                            prog.completed += 1;
                            match result.result {
                                TestResult::Passed => prog.passed += 1,
                                TestResult::Failed => prog.failed += 1,
                                TestResult::Skipped => prog.skipped += 1,
                                _ => {}
                            }
                        }

                        results.lock().push(result);
                        Ok::<(), TestingError>(())
                    })
            })?;
        } else {
            for test in tests {
                if *cancel_flag.lock() {
                    break;
                }

                let result = executor(&test)?;

                {
                    let mut prog = progress.lock();
                    prog.completed += 1;
                    match result.result {
                        TestResult::Passed => prog.passed += 1,
                        TestResult::Failed => prog.failed += 1,
                        TestResult::Skipped => prog.skipped += 1,
                        _ => {}
                    }
                }

                results.lock().push(result);

                if self.config.fail_fast && results.lock().iter().any(|r| r.is_failure()) {
                    info!("Fail fast triggered, stopping execution");
                    break;
                }
            }
        }

        *running.lock() = false;

        let results = Arc::try_unwrap(results)
            .map_err(|_| TestingError::lock_error("Failed to unwrap results"))?
            .into_inner();

        info!(
            "Parallel execution completed: {} tests in {:?}",
            results.len(),
            start.elapsed()
        );

        Ok(results)
    }

    pub fn execute_suite_parallel<F>(
        &self,
        suite: &TestSuite,
        executor: F,
    ) -> TestingResult<TestSuiteResult>
    where
        F: Fn(&TestCase) -> TestingResult<TestExecutionResult> + Send + Sync,
    {
        let start = Instant::now();
        let results = self.execute_parallel(suite.test_cases.clone(), executor)?;

        let mut suite_result = TestSuiteResult::new(&suite.id, &suite.name);
        for result in results {
            suite_result.add_result(result);
        }

        Ok(suite_result)
    }
}

pub struct WorkStealingPool {
    num_workers: usize,
    tasks: crossbeam::queue::SegQueue<Task>,
}

struct Task {
    test: TestCase,
}

impl WorkStealingPool {
    pub fn new(num_workers: usize) -> Self {
        Self {
            num_workers,
            tasks: crossbeam::queue::SegQueue::new(),
        }
    }

    pub fn push(&self, test: TestCase) {
        self.tasks.push(Task { test });
    }

    pub fn pop(&self) -> Option<TestCase> {
        self.tasks.pop().map(|t| t.test)
    }

    pub fn len(&self) -> usize {
        self.tasks.len()
    }

    pub fn is_empty(&self) -> bool {
        self.tasks.is_empty()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SchedulingStrategy {
    Fifo,
    Priority,
    ShortestFirst,
    LongestFirst,
}

impl Default for SchedulingStrategy {
    fn default() -> Self {
        Self::Fifo
    }
}

pub fn sort_tests_by_strategy(tests: &mut [TestCase], strategy: SchedulingStrategy) {
    match strategy {
        SchedulingStrategy::Fifo => {}
        SchedulingStrategy::Priority => tests.sort_by(|a, b| b.priority.cmp(&a.priority)),
        SchedulingStrategy::ShortestFirst => {
            tests.sort_by(|a, b| {
                a.timeout.unwrap_or(Duration::MAX)
                    .cmp(&b.timeout.unwrap_or(Duration::MAX))
            })
        }
        SchedulingStrategy::LongestFirst => {
            tests.sort_by(|a, b| {
                b.timeout.unwrap_or(Duration::ZERO)
                    .cmp(&a.timeout.unwrap_or(Duration::ZERO))
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn create_test_case(id: &str) -> TestCase {
        TestCase::new(id, format!("test_{}", id), PathBuf::from("test.rs"), 1)
    }

    #[test]
    fn test_parallel_executor() {
        let config = TestConfig::new().with_parallel(true).with_max_concurrent(2);
        let executor = ParallelExecutor::new(&config);

        let tests: Vec<TestCase> = (0..5).map(|i| create_test_case(&format!("t{}", i))).collect();

        let results = executor.execute_parallel(tests, |test| {
            Ok(TestExecutionResult::passed(test, Duration::from_millis(10)))
        }).unwrap();

        assert_eq!(results.len(), 5);
        assert!(results.iter().all(|r| r.is_success()));
    }

    #[test]
    fn test_scheduling_strategies() {
        let mut tests = vec![
            create_test_case("a").with_priority(crate::types::TestPriority::Low),
            create_test_case("b").with_priority(crate::types::TestPriority::High),
            create_test_case("c").with_priority(crate::types::TestPriority::Normal),
        ];

        sort_tests_by_strategy(&mut tests, SchedulingStrategy::Priority);

        assert_eq!(tests[0].id.as_str(), "b");
    }

    #[test]
    fn test_cancel() {
        let config = TestConfig::new();
        let executor = ParallelExecutor::new(&config);
        
        executor.cancel();
        assert!(*executor.cancel_flag.lock());
    }
}
