use anyhow::{Context, Result};
use tree_sitter::{InputEdit, Parser, Point, Tree};

/// Incremental parser for efficient real-time code analysis
pub struct IncrementalParser {
    parser: Parser,
    old_tree: Option<Tree>,
    old_source: Option<String>,
}

impl IncrementalParser {
    /// Creates a new incremental parser
    pub fn new() -> Result<Self> {
        let parser = Parser::new();
        Ok(Self {
            parser,
            old_tree: None,
            old_source: None,
        })
    }

    /// Sets the language for parsing
    pub fn set_language(&mut self, language: &str) -> Result<()> {
        match language {
            "rust" => {
                self.parser
                    .set_language(&tree_sitter_rust::LANGUAGE.into())?;
            }
            "javascript" | "typescript" => {
                self.parser
                    .set_language(&tree_sitter_javascript::LANGUAGE.into())?;
            }
            "python" => {
                self.parser
                    .set_language(&tree_sitter_python::LANGUAGE.into())?;
            }
            "go" => {
                self.parser.set_language(&tree_sitter_go::LANGUAGE.into())?;
            }
            _ => anyhow::bail!("Unsupported language: {}", language),
        }
        Ok(())
    }

    /// Parses source code incrementally
    pub fn parse_incremental(&mut self, source: &str) -> Result<Tree> {
        let tree =
            if let (Some(old_tree), Some(_old_source)) = (&self.old_tree, &self.old_source) {
                // Apply edit and reparse
                self.parser.parse(source, Some(old_tree))
            } else {
                // First parse
                self.parser.parse(source, None)
            }
            .context("Failed to parse source code")?;

        self.old_tree = Some(tree.clone());
        self.old_source = Some(source.to_string());

        Ok(tree)
    }

    /// Calculates the edit between old and new source
    fn calculate_edit(&self, old_source: &str, new_source: &str) -> InputEdit {
        // Simple implementation - find first difference
        let old_bytes = old_source.as_bytes();
        let new_bytes = new_source.as_bytes();

        let start_byte = old_bytes
            .iter()
            .zip(new_bytes.iter())
            .position(|(a, b)| a != b)
            .unwrap_or(old_bytes.len().min(new_bytes.len()));

        let old_end_byte = old_bytes.len();
        let new_end_byte = new_bytes.len();

        let start_position = self.byte_to_position(old_source, start_byte);
        let old_end_position = self.byte_to_position(old_source, old_end_byte);
        let new_end_position = self.byte_to_position(new_source, new_end_byte);

        InputEdit {
            start_byte,
            old_end_byte,
            new_end_byte,
            start_position,
            old_end_position,
            new_end_position,
        }
    }

    /// Converts byte offset to position
    fn byte_to_position(&self, source: &str, byte_offset: usize) -> Point {
        let mut line = 0;
        let mut column = 0;

        for (i, c) in source.char_indices() {
            if i >= byte_offset {
                break;
            }
            if c == '\n' {
                line += 1;
                column = 0;
            } else {
                column += 1;
            }
        }

        Point { row: line, column }
    }

    /// Gets changed ranges between old and new tree
    pub fn get_changed_ranges(
        &self,
        new_tree: &Tree,
    ) -> Vec<(tree_sitter::Range, tree_sitter::Range)> {
        if let Some(old_tree) = &self.old_tree {
            old_tree
                .changed_ranges(new_tree)
                .map(|range| (range, range))
                .collect()
        } else {
            Vec::new()
        }
    }
}

impl Default for IncrementalParser {
    fn default() -> Self {
        Self::new().expect("Failed to create IncrementalParser")
    }
}
