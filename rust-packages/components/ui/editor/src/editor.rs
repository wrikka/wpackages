use crate::buffer::TextBuffer;
use crate::components::code_folding::FoldingManager;
use crate::components::cursor_operations::MultiCursorOperations;
use crate::components::cursor_selection::SelectionManager;
use crate::error::{EditorError, EditorResult};
use crate::history::{HistoryManager, TextOperation};
use crate::services::bracket::{BracketMatch, BracketMatcher};
use crate::services::git::GitIntegration;
use crate::services::indentation::IndentationService;
use crate::services::lsp::LspClient;
use crate::services::snippets::{Snippet, SnippetManager};
use crate::services::syntax::SyntaxService;
use crate::types::{Position, Range};
use std::path::Path;

/// Main editor struct - UI-agnostic core editing engine
#[derive(Clone)]
pub struct Editor {
    buffer: TextBuffer,
    cursor: MultiCursorOperations,
    selection: SelectionManager,
    folding: FoldingManager,
    lsp: LspClient,
    syntax: SyntaxService,
    history: HistoryManager,
    indentation: IndentationService,
    bracket: BracketMatcher,
    snippets: SnippetManager,
    git: GitIntegration,
    version: i32,
}

impl Default for Editor {
    fn default() -> Self {
        Self::new()
    }
}

impl Editor {
    /// Create a new empty editor
    pub fn new() -> Self {
        let mut snippets = SnippetManager::new();
        snippets.load_defaults();

        Self {
            buffer: TextBuffer::new(),
            cursor: MultiCursorOperations::new(),
            selection: SelectionManager::new(),
            folding: FoldingManager::new(),
            lsp: LspClient::new(),
            syntax: SyntaxService::new(),
            history: HistoryManager::new(),
            indentation: IndentationService::new(),
            bracket: BracketMatcher::new(),
            snippets,
            git: GitIntegration::new(),
            version: 0,
        }
    }

    /// Load a file into the editor
    pub fn load_file(&mut self, path: &Path) -> EditorResult<()> {
        let text = std::fs::read_to_string(path)
            .map_err(|e| EditorError::Io(e))?;
        self.buffer = TextBuffer::from_str(&text);
        self.version = 0;
        self.history.clear();
        
        // Update syntax highlighting
        let lang = self.syntax.detect_language(path.to_str().unwrap_or(""));
        if let Some(lang) = lang {
            self.folding.update(&text, lang)?;
        }
        
        Ok(())
    }

    /// Get the current text content
    pub fn get_text(&self) -> String {
        self.buffer.to_string()
    }

    /// Get the text buffer
    pub fn buffer(&self) -> &TextBuffer {
        &self.buffer
    }

    /// Get mutable reference to text buffer
    pub fn buffer_mut(&mut self) -> &mut TextBuffer {
        &mut self.buffer
    }

    /// Insert text at cursor position
    pub fn insert_text(&mut self, pos: Position, text: &str) -> EditorResult<()> {
        if text.is_empty() {
            return Ok(());
        }
        
        let char_idx = self.buffer.pos_to_char_idx(pos).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        self.buffer.insert(pos, text).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        // Record in history
        self.history.push(TextOperation::insert(char_idx, text.to_string()))
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        // Increment version for LSP
        self.version += 1;
        
        Ok(())
    }

    /// Delete text at cursor position
    pub fn delete_text(&mut self, range: Range) -> EditorResult<String> {
        let start_idx = self.buffer.pos_to_char_idx(range.start).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        let removed = self.buffer.remove(range).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        // Record in history
        self.history.push(TextOperation::remove(start_idx, removed.clone()))
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        // Increment version for LSP
        self.version += 1;
        
        Ok(removed)
    }

    /// Get cursor position
    pub fn get_cursor_position(&self) -> Position {
        use crate::components::multi_cursor::CursorPosition;
        match self.cursor.cursor_manager().get_primary_cursor() {
            Ok(cursor) => Position::new(cursor.position.line, cursor.position.column),
            Err(_) => Position::zero(),
        }
    }

    /// Set cursor position
    pub fn set_cursor_position(&mut self, pos: Position) {
        use crate::components::multi_cursor::{Cursor, CursorPosition};
        if let Ok(cursor) = self.cursor.cursor_manager_mut().get_primary_cursor_mut() {
            cursor.position = CursorPosition::new(pos.line, pos.character);
        }
    }

    /// Get document version
    pub fn version(&self) -> i32 {
        self.version
    }

    /// Get history manager
    pub fn history(&self) -> &HistoryManager {
        &self.history
    }

    /// Get mutable history manager
    pub fn history_mut(&mut self) -> &mut HistoryManager {
        &mut self.history
    }

    /// Get LSP diagnostics
    pub fn get_diagnostics(&self) -> Vec<lsp_types::Diagnostic> {
        self.lsp.get_diagnostics()
    }

    /// Get LSP completions
    pub fn get_completions(&self, position: Position) -> Vec<lsp_types::CompletionItem> {
        self.lsp.get_completions(position)
    }

    /// Go to definition
    pub fn go_to_definition(&self, position: Position) -> Option<lsp_types::Location> {
        self.lsp.go_to_definition(position)
    }

    /// Search text
    pub fn search(&self, query: &str, case_sensitive: bool) -> Vec<(Position, Position)> {
        use regex::Regex;
        
        if query.is_empty() {
            return Vec::new();
        }
        
        let text = self.buffer.to_string();
        let re = if case_sensitive {
            Regex::new(query)
        } else {
            Regex::new(&format!("(?i){}", regex::escape(query)))
        };
        
        match re {
            Ok(regex) => {
                let mut results = Vec::new();
                for mat in regex.find_iter(&text) {
                    let start = self.buffer.char_idx_to_pos(mat.start()).unwrap_or(Position::zero());
                    let end = self.buffer.char_idx_to_pos(mat.end()).unwrap_or(Position::zero());
                    results.push((start, end));
                }
                results
            }
            Err(_) => Vec::new(),
        }
    }

    /// Replace text
    pub fn replace(&mut self, range: Range, text: &str) -> EditorResult<String> {
        if text.is_empty() {
            return self.delete_text(range);
        }
        
        let start_idx = self.buffer.pos_to_char_idx(range.start).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        let old_text = self.buffer.slice(range).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        self.buffer.replace(range, text).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        // Record in history
        self.history.push(TextOperation::replace(start_idx, old_text.clone(), text.to_string()))
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        // Increment version for LSP
        self.version += 1;
        
        Ok(old_text)
    }

    /// Undo last operation
    pub fn undo(&mut self) -> EditorResult<()> {
        let operation = self.history.undo().map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        self.apply_operation(&operation)
    }

    /// Redo last undone operation
    pub fn redo(&mut self) -> EditorResult<()> {
        let operation = self.history.redo().map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        self.apply_operation(&operation)
    }

    fn apply_operation(&mut self, operation: &TextOperation) -> EditorResult<()> {
        match operation {
            TextOperation::Insert { position, text } => {
                let pos = self.buffer.char_idx_to_pos(*position).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
                self.buffer.insert(pos, text).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
            }
            TextOperation::Remove { position, text } => {
                let pos = self.buffer.char_idx_to_pos(*position).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
                let end_pos = self.buffer.char_idx_to_pos(position + text.len()).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
                self.buffer.remove(Range::new(pos, end_pos)).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
            }
            TextOperation::Replace { position, old_text, new_text } => {
                let pos = self.buffer.char_idx_to_pos(*position).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
                let end_pos = self.buffer.char_idx_to_pos(position + old_text.len()).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
                self.buffer.replace(Range::new(pos, end_pos), new_text).map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
            }
        }
        self.version += 1;
        Ok(())
    }

    /// Auto-indent a line
    pub fn auto_indent_line(&mut self, line_idx: usize) -> EditorResult<()> {
        self.indentation
            .auto_indent_line(&mut self.buffer, line_idx)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get indentation for a new line at position
    pub fn get_indent_for_new_line(&self, pos: Position) -> EditorResult<String> {
        self.indentation
            .get_indent_for_position(&self.buffer, pos)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Insert new line with auto-indentation
    pub fn insert_new_line(&mut self, pos: Position) -> EditorResult<()> {
        let indent = self.get_indent_for_new_line(pos)?;
        let newline = "\n".to_string() + &indent;
        self.insert_text(pos, &newline)
    }

    /// Get indentation service
    pub fn indentation(&self) -> &IndentationService {
        &self.indentation
    }

    /// Get mutable indentation service
    pub fn indentation_mut(&mut self) -> &mut IndentationService {
        &mut self.indentation
    }

    /// Find matching bracket for the given position
    pub fn find_matching_bracket(&self, pos: Position) -> EditorResult<BracketMatch> {
        self.bracket
            .find_match(&self.buffer, pos)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get all bracket pairs in the buffer
    pub fn get_all_bracket_pairs(&self) -> EditorResult<Vec<(Position, Position)>> {
        self.bracket
            .get_all_matches(&self.buffer)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Check if a position is inside a bracket pair
    pub fn is_inside_bracket_pair(&self, pos: Position) -> EditorResult<bool> {
        self.bracket
            .is_inside_pair(&self.buffer, pos)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get the enclosing bracket pair for a position
    pub fn get_enclosing_bracket_pair(&self, pos: Position) -> EditorResult<Option<(Position, Position)>> {
        self.bracket
            .get_enclosing_pair(&self.buffer, pos)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Auto-close bracket
    pub fn auto_close_bracket(&mut self, pos: Position, bracket: char) -> EditorResult<()> {
        let closing_bracket = match bracket {
            '(' => ')',
            '[' => ']',
            '{' => '}',
            '<' => '>',
            '"' => '"',
            '\'' => '\'',
            _ => return Ok(()),
        };

        // Insert the closing bracket
        let closing_pos = Position::new(pos.line, pos.character + 1);
        self.insert_text(closing_pos, &closing_bracket.to_string())?;

        Ok(())
    }

    /// Get bracket matcher
    pub fn bracket_matcher(&self) -> &BracketMatcher {
        &self.bracket
    }

    /// Get mutable bracket matcher
    pub fn bracket_matcher_mut(&mut self) -> &mut BracketMatcher {
        &mut self.bracket
    }

    /// Get snippet manager
    pub fn snippet_manager(&self) -> &SnippetManager {
        &self.snippets
    }

    /// Get mutable snippet manager
    pub fn snippet_manager_mut(&mut self) -> &mut SnippetManager {
        &mut self.snippets
    }

    /// Find snippet by prefix
    pub fn find_snippet(&self, prefix: &str, language: Option<&str>) -> Option<&Snippet> {
        self.snippets.find_by_prefix(prefix, language)
    }

    /// Search snippets
    pub fn search_snippets(&self, query: &str, language: Option<&str>) -> Vec<&Snippet> {
        self.snippets.search(query, language)
    }

    /// Insert snippet at position
    pub fn insert_snippet(&mut self, pos: Position, snippet: &Snippet, values: &std::collections::HashMap<String, String>) -> EditorResult<()> {
        let expanded = snippet.expand(values);
        self.insert_text(pos, &expanded)?;
        Ok(())
    }

    /// Add custom snippet
    pub fn add_snippet(&mut self, snippet: Snippet) {
        self.snippets.add_snippet(snippet);
    }

    /// Remove snippet
    pub fn remove_snippet(&mut self, name: &str, language: &str) -> bool {
        self.snippets.remove_snippet(name, language)
    }

    /// Get git integration
    pub fn git(&self) -> &GitIntegration {
        &self.git
    }

    /// Get mutable git integration
    pub fn git_mut(&mut self) -> &mut GitIntegration {
        &mut self.git
    }

    /// Update git status for current file
    pub fn update_git_status(&mut self, file_path: &str) -> EditorResult<()> {
        self.git
            .update_file_status(file_path)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get git status for a file
    pub fn get_git_status(&self, file_path: &str) -> Option<crate::services::git::GitStatus> {
        self.git.get_file_status(file_path)
    }

    /// Get git diff for current file
    pub fn get_git_diff(&self, file_path: &str) -> EditorResult<crate::services::git::GitDiff> {
        self.git
            .get_diff(file_path)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get git blame for a line
    pub fn get_git_blame(&self, file_path: &str, line: usize) -> EditorResult<Option<crate::services::git::GitBlame>> {
        self.git
            .get_blame(file_path, line)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get git log for current file
    pub fn get_git_log(&self, file_path: &str, limit: usize) -> EditorResult<Vec<crate::services::git::GitCommit>> {
        self.git
            .get_log(file_path, limit)
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }

    /// Get all modified files
    pub fn get_modified_files(&self) -> Vec<String> {
        self.git.get_modified_files()
    }

    /// Refresh all git statuses
    pub fn refresh_git_statuses(&mut self) -> EditorResult<()> {
        self.git
            .refresh_statuses()
            .map_err(|e| EditorError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
    }
}
