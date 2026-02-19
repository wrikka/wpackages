use anyhow::{Context, Result};
use tree_sitter::{Parser, Tree, TreeCursor};

/// AST parser for code understanding
pub struct AstParser {
    parser: Parser,
}

impl AstParser {
    /// Creates a new AST parser
    pub fn new() -> Result<Self> {
        let parser = Parser::new();
        Ok(Self { parser })
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

    /// Parses source code and returns AST
    pub fn parse(&mut self, source: &str) -> Result<Tree> {
        let tree = self
            .parser
            .parse(source, None)
            .context("Failed to parse source code")?;
        Ok(tree)
    }

    /// Gets symbols from AST
    pub fn get_symbols(&self, tree: &Tree) -> Vec<Symbol> {
        let mut symbols = Vec::new();
        let mut cursor = tree.walk();

        self.traverse_tree(&mut cursor, &mut symbols);
        symbols
    }

    fn traverse_tree(&self, cursor: &mut TreeCursor, symbols: &mut Vec<Symbol>) {
        loop {
            let node = cursor.node();
            let kind = node.kind();

            if self.is_definition_node(kind) {
                if let Some(name) = self.extract_symbol_name(node) {
                    symbols.push(Symbol {
                        name,
                        kind: kind.to_string(),
                        start_position: node.start_position(),
                        end_position: node.end_position(),
                    });
                }
            }

            if cursor.goto_first_child() {
                self.traverse_tree(cursor, symbols);
                while cursor.goto_next_sibling() {
                    self.traverse_tree(cursor, symbols);
                }
                cursor.goto_parent();
            }

            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }

    fn is_definition_node(&self, kind: &str) -> bool {
        matches!(
            kind,
            "function_definition"
                | "method_definition"
                | "class_definition"
                | "struct_item"
                | "enum_item"
                | "trait_item"
                | "impl_item"
                | "type_alias_declaration"
                | "variable_declaration"
                | "constant_declaration"
        )
    }

    fn extract_symbol_name(&self, node: tree_sitter::Node) -> Option<String> {
        for child in node.children(&mut node.walk()) {
            if child.kind() == "identifier" || child.kind() == "type_identifier" {
                return Some(child.utf8_text(&[]).ok()?.to_string());
            }
        }
        None
    }
}

impl Default for AstParser {
    fn default() -> Self {
        Self::new().expect("Failed to create AstParser")
    }
}

/// Represents a symbol in the code
#[derive(Debug, Clone, serde::Serialize)]
pub struct Symbol {
    pub name: String,
    pub kind: String,
    #[serde(skip)]
    pub start_position: tree_sitter::Point,
    #[serde(skip)]
    pub end_position: tree_sitter::Point,
}

/// Symbol resolver for resolving references
pub struct SymbolResolver {
    symbols: Vec<Symbol>,
}

impl SymbolResolver {
    /// Creates a new symbol resolver
    pub fn new(symbols: Vec<Symbol>) -> Self {
        Self { symbols }
    }

    /// Resolves a symbol reference
    pub fn resolve(&self, name: &str) -> Option<&Symbol> {
        self.symbols.iter().find(|s| s.name == name)
    }

    /// Gets all symbols of a specific kind
    pub fn get_symbols_by_kind(&self, kind: &str) -> Vec<&Symbol> {
        self.symbols.iter().filter(|s| s.kind == kind).collect()
    }
}
