//! Language Server Protocol (LSP) types

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration for a language server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageServerConfig {
    /// Unique identifier for this language server
    pub id: String,

    /// Languages this server supports
    pub languages: Vec<String>,

    /// Command to start the server
    pub command: String,

    /// Arguments to pass to the command
    pub args: Vec<String>,

    /// Working directory (optional)
    pub working_dir: Option<String>,

    /// Environment variables (optional)
    pub env: HashMap<String, String>,
}

impl LanguageServerConfig {
    /// Creates a new language server configuration
    pub fn new(id: impl Into<String>, languages: Vec<String>, command: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            languages,
            command: command.into(),
            args: Vec::new(),
            working_dir: None,
            env: HashMap::new(),
        }
    }

    /// Adds an argument
    pub fn with_arg(mut self, arg: impl Into<String>) -> Self {
        self.args.push(arg.into());
        self
    }

    /// Sets the working directory
    pub fn with_working_dir(mut self, dir: impl Into<String>) -> Self {
        self.working_dir = Some(dir.into());
        self
    }

    /// Adds an environment variable
    pub fn with_env(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.env.insert(key.into(), value.into());
        self
    }
}

/// LSP position in a document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    /// Line number (0-based)
    pub line: u32,

    /// Character offset (0-based)
    pub character: u32,
}

impl Position {
    pub fn new(line: u32, character: u32) -> Self {
        Self { line, character }
    }
}

/// LSP range in a document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Range {
    /// Start position
    pub start: Position,

    /// End position
    pub end: Position,
}

impl Range {
    pub fn new(start: Position, end: Position) -> Self {
        Self { start, end }
    }
}

/// LSP location
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    /// Document URI
    pub uri: String,

    /// Range in the document
    pub range: Range,
}

/// LSP diagnostic severity
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum DiagnosticSeverity {
    Error = 1,
    Warning = 2,
    Information = 3,
    Hint = 4,
}

/// LSP diagnostic
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagnostic {
    /// Range in the document
    pub range: Range,

    /// Diagnostic severity
    pub severity: Option<DiagnosticSeverity>,

    /// Diagnostic message
    pub message: String,

    /// Diagnostic code (optional)
    pub code: Option<String>,

    /// Source of the diagnostic (e.g., "typescript")
    pub source: Option<String>,
}

impl Diagnostic {
    pub fn new(range: Range, message: impl Into<String>) -> Self {
        Self {
            range,
            severity: None,
            message: message.into(),
            code: None,
            source: None,
        }
    }

    pub fn with_severity(mut self, severity: DiagnosticSeverity) -> Self {
        self.severity = Some(severity);
        self
    }

    pub fn with_code(mut self, code: impl Into<String>) -> Self {
        self.code = Some(code.into());
        self
    }

    pub fn with_source(mut self, source: impl Into<String>) -> Self {
        self.source = Some(source.into());
        self
    }
}

/// LSP completion item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionItem {
    /// Label for this completion item
    pub label: String,

    /// Kind of completion
    pub kind: Option<CompletionItemKind>,

    /// Detail about the item
    pub detail: Option<String>,

    /// Documentation for the item
    pub documentation: Option<String>,

    /// Text to insert
    pub insert_text: Option<String>,

    /// Additional text edits
    pub additional_text_edits: Option<Vec<TextEdit>>,
}

impl CompletionItem {
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            kind: None,
            detail: None,
            documentation: None,
            insert_text: None,
            additional_text_edits: None,
        }
    }

    pub fn with_kind(mut self, kind: CompletionItemKind) -> Self {
        self.kind = Some(kind);
        self
    }

    pub fn with_detail(mut self, detail: impl Into<String>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn with_documentation(mut self, doc: impl Into<String>) -> Self {
        self.documentation = Some(doc.into());
        self
    }

    pub fn with_insert_text(mut self, text: impl Into<String>) -> Self {
        self.insert_text = Some(text.into());
        self
    }
}

/// LSP completion item kind
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum CompletionItemKind {
    Text = 1,
    Method = 2,
    Function = 3,
    Constructor = 4,
    Field = 5,
    Variable = 6,
    Class = 7,
    Interface = 8,
    Module = 9,
    Property = 10,
    Unit = 11,
    Value = 12,
    Enum = 13,
    Keyword = 14,
    Snippet = 15,
    Color = 16,
    File = 17,
    Reference = 18,
    Folder = 19,
    EnumMember = 20,
    Constant = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25,
}

/// LSP text edit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextEdit {
    /// Range to replace
    pub range: Range,

    /// New text
    pub new_text: String,
}

impl TextEdit {
    pub fn new(range: Range, new_text: impl Into<String>) -> Self {
        Self {
            range,
            new_text: new_text.into(),
        }
    }
}

/// LSP hover information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hover {
    /// Hover contents
    pub contents: HoverContents,

    /// Range the hover applies to
    pub range: Option<Range>,
}

impl Hover {
    pub fn new(contents: HoverContents) -> Self {
        Self {
            contents,
            range: None,
        }
    }

    pub fn with_range(mut self, range: Range) -> Self {
        self.range = Some(range);
        self
    }
}

/// LSP hover contents
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum HoverContents {
    /// Plain text
    PlainText(String),

    /// Markdown
    Markdown(String),

    /// Markup content with language
    MarkupContent { kind: String, value: String },
}

/// LSP symbol information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolInformation {
    /// Name of the symbol
    pub name: String,

    /// Kind of symbol
    pub kind: SymbolKind,

    /// Location of the symbol
    pub location: Location,

    /// Container name (optional)
    pub container_name: Option<String>,
}

impl SymbolInformation {
    pub fn new(name: impl Into<String>, kind: SymbolKind, location: Location) -> Self {
        Self {
            name: name.into(),
            kind,
            location,
            container_name: None,
        }
    }

    pub fn with_container(mut self, container: impl Into<String>) -> Self {
        self.container_name = Some(container.into());
        self
    }
}

/// LSP symbol kind
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SymbolKind {
    File = 1,
    Module = 2,
    Namespace = 3,
    Package = 4,
    Class = 5,
    Method = 6,
    Property = 7,
    Field = 8,
    Constructor = 9,
    Enum = 10,
    Interface = 11,
    Function = 12,
    Variable = 13,
    Constant = 14,
    String = 15,
    Number = 16,
    Boolean = 17,
    Array = 18,
    Object = 19,
    Key = 20,
    Null = 21,
    EnumMember = 22,
    Struct = 23,
    Event = 24,
    Operator = 25,
    TypeParameter = 26,
}

/// LSP code lens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeLens {
    /// Range the code lens applies to
    pub range: Range,

    /// Command to execute
    pub command: Option<Command>,

    /// Title for the code lens
    pub title: Option<String>,
}

impl CodeLens {
    pub fn new(range: Range) -> Self {
        Self {
            range,
            command: None,
            title: None,
        }
    }

    pub fn with_command(mut self, command: Command) -> Self {
        self.command = Some(command);
        self
    }

    pub fn with_title(mut self, title: impl Into<String>) -> Self {
        self.title = Some(title.into());
        self
    }
}

/// LSP command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    /// Command title
    pub title: String,

    /// Command identifier
    pub command: String,

    /// Command arguments
    pub arguments: Option<Vec<serde_json::Value>>,
}

impl Command {
    pub fn new(title: impl Into<String>, command: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            command: command.into(),
            arguments: None,
        }
    }

    pub fn with_arguments(mut self, args: Vec<serde_json::Value>) -> Self {
        self.arguments = Some(args);
        self
    }
}
