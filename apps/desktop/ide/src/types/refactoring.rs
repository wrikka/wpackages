#[derive(Debug, Clone, Default)]
pub struct RefactoringClient {
    pub history: Vec<RefactoringResult>,
}

impl RefactoringClient {
    pub fn new() -> Self {
        Self {
            history: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct RefactoringResult {
    pub operation: String,
    pub success: bool,
    pub edits: Vec<TextEdit>,
    pub preview: String,
}

#[derive(Debug, Clone)]
pub struct TextEdit {
    pub range: (usize, usize, usize, usize),
    pub new_text: String,
}
