#[derive(Debug, Clone, Default)]
pub struct AdvancedTestingClient {
    pub suites: Vec<TestSuite>,
}

impl AdvancedTestingClient {
    pub fn new() -> Self {
        Self {
            suites: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TestSuite {
    pub id: String,
    pub name: String,
    pub file_path: String,
    pub test_cases: Vec<TestCase>,
}

impl TestSuite {
    pub fn new(id: String, name: String, file_path: String) -> Self {
        Self {
            id,
            name,
            file_path,
            test_cases: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TestCase {
    pub id: String,
    pub name: String,
    pub line: usize,
    pub tags: Vec<String>,
    pub priority: TestPriority,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TestPriority {
    Low,
    Normal,
    High,
    Critical,
}
