use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedDocument {
    pub content: String,
    pub metadata: DocumentMetadata,
    pub sections: Vec<DocumentSection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub format: DocumentFormat,
    pub title: Option<String>,
    pub author: Option<String>,
    pub created_date: Option<String>,
    pub modified_date: Option<String>,
    pub language: Option<String>,
    pub page_count: Option<usize>,
    pub word_count: usize,
    pub char_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentSection {
    pub title: Option<String>,
    pub content: String,
    pub level: Option<usize>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DocumentFormat {
    Pdf,
    Markdown,
    Html,
    Docx,
    Text,
    Code,
    Unknown,
}

impl DocumentFormat {
    pub fn from_extension(ext: &str) -> Self {
        match ext.to_lowercase().as_str() {
            "pdf" => DocumentFormat::Pdf,
            "md" | "markdown" => DocumentFormat::Markdown,
            "html" | "htm" => DocumentFormat::Html,
            "docx" => DocumentFormat::Docx,
            "txt" => DocumentFormat::Text,
            "rs" | "py" | "js" | "ts" | "java" | "go" | "cpp" | "c" | "h" => DocumentFormat::Code,
            _ => DocumentFormat::Unknown,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseOptions {
    pub extract_metadata: bool,
    pub extract_sections: bool,
    pub preserve_formatting: bool,
    pub include_code_blocks: bool,
}

impl Default for ParseOptions {
    fn default() -> Self {
        Self {
            extract_metadata: true,
            extract_sections: true,
            preserve_formatting: false,
            include_code_blocks: true,
        }
    }
}
