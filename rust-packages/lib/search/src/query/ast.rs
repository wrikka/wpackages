use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Query {
    Search(SearchQuery),
    Logical(LogicalQuery),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SearchQuery {
    pub field: SearchField,
    pub operator: ComparisonOp,
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LogicalQuery {
    pub left: Box<Query>,
    pub operator: LogicalOp,
    pub right: Box<Query>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SearchField {
    Function,
    Class,
    Struct,
    Enum,
    Trait,
    Interface,
    Method,
    Variable,
    Constant,
    Type,
    Module,
    File,
    Path,
    Symbol,
    Calls,
    CalledBy,
    References,
    Implements,
    Extends,
    Imports,
    Exports,
    Returns,
    Throws,
    Text,
    Regex,
}

impl fmt::Display for SearchField {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SearchField::Function => write!(f, "fn"),
            SearchField::Class => write!(f, "class"),
            SearchField::Struct => write!(f, "struct"),
            SearchField::Enum => write!(f, "enum"),
            SearchField::Trait => write!(f, "trait"),
            SearchField::Interface => write!(f, "interface"),
            SearchField::Method => write!(f, "method"),
            SearchField::Variable => write!(f, "var"),
            SearchField::Constant => write!(f, "const"),
            SearchField::Type => write!(f, "type"),
            SearchField::Module => write!(f, "mod"),
            SearchField::File => write!(f, "file"),
            SearchField::Path => write!(f, "path"),
            SearchField::Symbol => write!(f, "sym"),
            SearchField::Calls => write!(f, "calls"),
            SearchField::CalledBy => write!(f, "called_by"),
            SearchField::References => write!(f, "refs"),
            SearchField::Implements => write!(f, "implements"),
            SearchField::Extends => write!(f, "extends"),
            SearchField::Imports => write!(f, "imports"),
            SearchField::Exports => write!(f, "exports"),
            SearchField::Returns => write!(f, "returns"),
            SearchField::Throws => write!(f, "throws"),
            SearchField::Text => write!(f, "text"),
            SearchField::Regex => write!(f, "regex"),
        }
    }
}

impl std::str::FromStr for SearchField {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "fn" | "func" | "function" => Ok(SearchField::Function),
            "class" => Ok(SearchField::Class),
            "struct" => Ok(SearchField::Struct),
            "enum" => Ok(SearchField::Enum),
            "trait" => Ok(SearchField::Trait),
            "interface" => Ok(SearchField::Interface),
            "method" => Ok(SearchField::Method),
            "var" | "variable" => Ok(SearchField::Variable),
            "const" | "constant" => Ok(SearchField::Constant),
            "type" => Ok(SearchField::Type),
            "mod" | "module" => Ok(SearchField::Module),
            "file" => Ok(SearchField::File),
            "path" => Ok(SearchField::Path),
            "sym" | "symbol" => Ok(SearchField::Symbol),
            "calls" => Ok(SearchField::Calls),
            "called_by" | "calledby" => Ok(SearchField::CalledBy),
            "refs" | "references" => Ok(SearchField::References),
            "implements" => Ok(SearchField::Implements),
            "extends" => Ok(SearchField::Extends),
            "imports" => Ok(SearchField::Imports),
            "exports" => Ok(SearchField::Exports),
            "returns" => Ok(SearchField::Returns),
            "throws" => Ok(SearchField::Throws),
            "text" => Ok(SearchField::Text),
            "regex" | "re" => Ok(SearchField::Regex),
            _ => Err(format!("unknown field: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ComparisonOp {
    Eq,
    NotEq,
    Like,
    NotLike,
    Matches,
    NotMatches,
}

impl fmt::Display for ComparisonOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ComparisonOp::Eq => write!(f, ":"),
            ComparisonOp::NotEq => write!(f, "!:"),
            ComparisonOp::Like => write!(f, "~"),
            ComparisonOp::NotLike => write!(f, "!~"),
            ComparisonOp::Matches => write!(f, "=~"),
            ComparisonOp::NotMatches => write!(f, "!~"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LogicalOp {
    And,
    Or,
    Not,
}

impl fmt::Display for LogicalOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LogicalOp::And => write!(f, "AND"),
            LogicalOp::Or => write!(f, "OR"),
            LogicalOp::Not => write!(f, "NOT"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QueryMetadata {
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_by: Option<String>,
    pub sort_desc: bool,
}

impl Default for QueryMetadata {
    fn default() -> Self {
        Self {
            limit: Some(100),
            offset: None,
            sort_by: None,
            sort_desc: false,
        }
    }
}
