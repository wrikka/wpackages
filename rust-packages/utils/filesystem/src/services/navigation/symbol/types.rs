//! Symbol types.
//!
//! This module contains core symbol data structures.

use lsp_types::{Position, Range, SymbolKind, Url};
use serde::{Deserialize, Serialize};

/// Symbol in codebase
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Symbol {
    pub name: String,
    pub kind: SymbolKind,
    pub location: SymbolLocation,
    pub container_name: Option<String>,
    pub detail: Option<String>,
    pub documentation: Option<String>,
    pub deprecated: bool,
}

impl Symbol {
    /// Create a new symbol.
    pub fn new(name: impl Into<String>, kind: SymbolKind, location: SymbolLocation) -> Self {
        Self {
            name: name.into(),
            kind,
            location,
            container_name: None,
            detail: None,
            documentation: None,
            deprecated: false,
        }
    }

    /// Set container name.
    pub fn with_container_name(mut self, container: impl Into<String>) -> Self {
        self.container_name = Some(container.into());
        self
    }

    /// Set detail.
    pub fn with_detail(mut self, detail: impl Into<String>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    /// Set documentation.
    pub fn with_documentation(mut self, doc: impl Into<String>) -> Self {
        self.documentation = Some(doc.into());
        self
    }

    /// Set deprecated status.
    pub fn with_deprecated(mut self, deprecated: bool) -> Self {
        self.deprecated = deprecated;
        self
    }

    /// Check if symbol is a function.
    pub fn is_function(&self) -> bool {
        matches!(
            self.kind,
            SymbolKind::FUNCTION
                | SymbolKind::METHOD
                | SymbolKind::CONSTRUCTOR
                | SymbolKind::NAMESPACE
        )
    }

    /// Check if symbol is a class.
    pub fn is_class(&self) -> bool {
        matches!(
            self.kind,
            SymbolKind::CLASS | SymbolKind::STRUCT | SymbolKind::INTERFACE
        )
    }

    /// Check if symbol is a variable.
    pub fn is_variable(&self) -> bool {
        matches!(
            self.kind,
            SymbolKind::VARIABLE | SymbolKind::CONSTANT | SymbolKind::PROPERTY | SymbolKind::FIELD
        )
    }

    /// Check if symbol is a type.
    pub fn is_type(&self) -> bool {
        matches!(
            self.kind,
            SymbolKind::ENUM
                | SymbolKind::INTERFACE
                | SymbolKind::TYPE_PARAMETER
                | SymbolKind::CLASS
                | SymbolKind::STRUCT
        )
    }
}

/// Symbol location
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolLocation {
    pub uri: Url,
    pub range: Range,
}

impl SymbolLocation {
    /// Create a new symbol location.
    pub fn new(uri: Url, range: Range) -> Self {
        Self { uri, range }
    }

    /// Get the start position.
    pub fn position(&self) -> Position {
        self.range.start
    }

    /// Get the end position.
    pub fn end_position(&self) -> Position {
        self.range.end
    }
}
