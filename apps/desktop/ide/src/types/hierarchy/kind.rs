//! # Hierarchy Kind
//!
//! Hierarchy kind enum and conversions.

use lsp_types::SymbolKind;
use serde::{Deserialize, Serialize};

/// Hierarchy kind
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum HierarchyKind {
    Type,
    Class,
    Interface,
    Struct,
    Enum,
    Module,
    Namespace,
    Package,
    Function,
    Method,
    Property,
    Field,
    Variable,
    Constant,
    Custom(String),
}

impl HierarchyKind {
    pub fn from_symbol_kind(kind: SymbolKind) -> Self {
        match kind {
            SymbolKind::CLASS => HierarchyKind::Class,
            SymbolKind::INTERFACE => HierarchyKind::Interface,
            SymbolKind::STRUCT => HierarchyKind::Struct,
            SymbolKind::ENUM => HierarchyKind::Enum,
            SymbolKind::MODULE => HierarchyKind::Module,
            SymbolKind::NAMESPACE => HierarchyKind::Namespace,
            SymbolKind::PACKAGE => HierarchyKind::Package,
            SymbolKind::FUNCTION => HierarchyKind::Function,
            SymbolKind::METHOD => HierarchyKind::Method,
            SymbolKind::PROPERTY => HierarchyKind::Property,
            SymbolKind::FIELD => HierarchyKind::Field,
            SymbolKind::VARIABLE => HierarchyKind::Variable,
            SymbolKind::CONSTANT => HierarchyKind::Constant,
            SymbolKind::TYPE_PARAMETER => HierarchyKind::Type,
            _ => HierarchyKind::Custom("Unknown".to_string()),
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            HierarchyKind::Type => "type",
            HierarchyKind::Class => "class",
            HierarchyKind::Interface => "interface",
            HierarchyKind::Struct => "struct",
            HierarchyKind::Enum => "enum",
            HierarchyKind::Module => "module",
            HierarchyKind::Namespace => "namespace",
            HierarchyKind::Package => "package",
            HierarchyKind::Function => "function",
            HierarchyKind::Method => "method",
            HierarchyKind::Property => "property",
            HierarchyKind::Field => "field",
            HierarchyKind::Variable => "variable",
            HierarchyKind::Constant => "constant",
            HierarchyKind::Custom(s) => s,
        }
    }
}
