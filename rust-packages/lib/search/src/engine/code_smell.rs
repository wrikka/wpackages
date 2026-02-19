#[cfg(feature = "symbol")]
use crate::engine::symbol;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
#[cfg(feature = "symbol")]
use thiserror::Error;
#[cfg(feature = "symbol")]
use tree_sitter::{LanguageError, Node, Parser};

#[cfg(feature = "symbol")]
#[derive(Error, Debug)]
pub enum CodeSmellError {
    #[error("I/O error reading file {0}: {1}")]
    Io(PathBuf, std::io::Error),
    #[error("tree-sitter language error: {0}")]
    Language(#[from] LanguageError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SmellKind {
    LongFunction,
    DeepNesting,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSmell {
    pub kind: SmellKind,
    pub description: String,
    pub path: String,
    pub line: usize,
}

#[cfg(feature = "symbol")]
const MAX_FUNCTION_LINES: usize = 50;
#[cfg(feature = "symbol")]
const MAX_NESTING_DEPTH: u32 = 5;

#[cfg(feature = "symbol")]
fn check_nesting_depth(node: Node, depth: u32) -> Option<u32> {
    let mut max_depth = depth;
    if matches!(node.kind(), "if_statement" | "for_statement" | "while_statement") {
        for i in 0..node.child_count() {
            if let Some(child_node) = node.child(i) {
                if let Some(d) = check_nesting_depth(child_node, depth + 1) {
                    max_depth = max_depth.max(d);
                }
            }
        }
    }
    if max_depth > depth { Some(max_depth) } else { None }
}

#[cfg(feature = "symbol")]
pub fn detect_smells(path: &Path) -> Result<Vec<CodeSmell>, CodeSmellError> {
    let Some(language) = symbol::get_language(path) else { return Ok(Vec::new()); };
    let code = std::fs::read_to_string(path).map_err(|e| CodeSmellError::Io(path.to_path_buf(), e))?;
    let mut parser = Parser::new();
    parser.set_language(language)?;
    let tree = parser.parse(&code, None).unwrap();
    let mut smells = Vec::new();

    let mut cursor = tree.walk();
    'nodes: loop {
        let node = cursor.node();

        if node.kind().contains("function") || node.kind().contains("method") {
            let start_line = node.start_position().row;
            let end_line = node.end_position().row;
            if end_line - start_line > MAX_FUNCTION_LINES {
                smells.push(CodeSmell {
                    kind: SmellKind::LongFunction,
                    description: format!("Function is {} lines long (max is {})", end_line - start_line, MAX_FUNCTION_LINES),
                    path: path.to_string_lossy().into_owned(),
                    line: start_line + 1,
                });
            }
        }

        if let Some(depth) = check_nesting_depth(node, 0) {
            if depth > MAX_NESTING_DEPTH {
                smells.push(CodeSmell {
                    kind: SmellKind::DeepNesting,
                    description: format!("Nesting depth is {} (max is {})", depth, MAX_NESTING_DEPTH),
                    path: path.to_string_lossy().into_owned(),
                    line: node.start_position().row + 1,
                });
            }
        }

        if !cursor.goto_first_child() {
            while !cursor.goto_next_sibling() {
                if !cursor.goto_parent() {
                    break 'nodes;
                }
            }
        }
    }

    Ok(smells)
}

#[cfg(not(feature = "symbol"))]
pub fn detect_smells(_path: &Path) -> Result<Vec<CodeSmell>, anyhow::Error> {
    Ok(Vec::new())
}
