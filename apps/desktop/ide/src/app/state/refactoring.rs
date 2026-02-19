use crate::types::refactoring::{RefactoringClient, RefactoringResult};

#[derive(Debug, Clone, Default)]
pub struct RefactoringState {
    pub client: RefactoringClient,
    pub last_result: Option<RefactoringResult>,
    pub available_refactorings: Vec<String>,
}

impl RefactoringState {
    pub fn new() -> Self {
        Self {
            client: RefactoringClient::new(),
            last_result: None,
            available_refactorings: vec![
                "extract_function".to_string(),
                "extract_variable".to_string(),
                "inline_variable".to_string(),
                "rename_symbol".to_string(),
                "move_file".to_string(),
                "delete_file".to_string(),
                "extract_interface".to_string(),
                "implement_interface".to_string(),
                "generate_documentation".to_string(),
                "optimize_imports".to_string(),
                "format_code".to_string(),
                "fix_lint_issues".to_string(),
            ],
        }
    }

    pub fn with_client(mut self, client: RefactoringClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_last_result(mut self, result: RefactoringResult) -> Self {
        self.last_result = Some(result);
        self
    }

    pub fn with_available_refactorings(mut self, refactorings: Vec<String>) -> Self {
        self.available_refactorings = refactorings;
        self
    }

    pub fn set_last_result(&mut self, result: RefactoringResult) {
        self.last_result = Some(result);
    }

    pub fn get_available_refactorings(&self) -> Vec<String> {
        self.available_refactorings.clone()
    }

    pub fn has_refactoring(&self, name: &str) -> bool {
        self.available_refactorings.contains(&name.to_string())
    }
}
