# Document Parsers Library

## Introduction

Document parsers for RAG systems supporting PDF, Markdown, HTML, DOCX, Text, and Code formats. This library provides a unified interface for parsing various document types, extracting text content, and preparing documents for processing by AI systems.

## Features

- 📄 **PDF Parsing** - Extract text from PDF documents
- 📝 **Markdown Parsing** - Parse and extract from Markdown
- 🌐 **HTML Parsing** - Extract content from HTML pages
- 📊 **DOCX Parsing** - Parse Microsoft Word documents
- 📃 **Text Parsing** - Plain text processing
- 💻 **Code Parsing** - Extract code from various languages
- ⚡ **Fast** - Optimized for performance
- 💾 **Caching** - Built-in caching support
- 📦 **Section Extraction** - Extract document sections and metadata

## Goal

- 🎯 Provide unified document parsing for RAG systems
- 📄 Support multiple document formats
- ⚡ Optimize for large document processing
- 💾 Enable caching for performance

## Design Principles

- 📄 **Unified Interface** - Consistent API across formats
- ⚡ **Efficient** - Fast parsing and extraction
- 💾 **Cacheable** - Support for result caching
- 🔍 **Accurate** - Preserve document structure

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
document-parsers = { path = "../document-parsers" }
```

## Usage

### Basic Parsing

```rust
use document_parsers::{ParsedDocument, DocumentFormat, ParseOptions};

// Parse with options
let options = ParseOptions::default();
let result = parse_document("document.pdf", DocumentFormat::Pdf, options)?;
println!("Content: {}", result.content);
```

### Format Detection from Extension

```rust
use document_parsers::DocumentFormat;

let format = DocumentFormat::from_extension("pdf");
assert_eq!(format, DocumentFormat::Pdf);

let format = DocumentFormat::from_extension("md");
assert_eq!(format, DocumentFormat::Markdown);
```

## Supported Formats

| Format | Extension | Parser |
|--------|-----------|--------|
| PDF | `.pdf` | `PdfParser` |
| Markdown | `.md`, `.markdown` | `MarkdownParser` |
| HTML | `.html`, `.htm` | `HtmlParser` |
| DOCX | `.docx` | `DocxParser` |
| Text | `.txt` | `TextParser` |
| Code | `.rs`, `.py`, `.js`, `.ts`, `.java`, `.go`, `.cpp`, `.c` | `CodeParser` |

## Data Structures

```rust
pub struct ParsedDocument {
    pub content: String,
    pub metadata: DocumentMetadata,
    pub sections: Vec<DocumentSection>,
}

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

pub struct DocumentSection {
    pub title: Option<String>,
    pub content: String,
    pub level: Option<usize>,
    pub metadata: Option<serde_json::Value>,
}
```

## Parse Options

```rust
use document_parsers::ParseOptions;

let options = ParseOptions {
    extract_metadata: true,      // Extract document metadata
    extract_sections: true,      // Extract document sections
    preserve_formatting: false,  // Keep original formatting
    include_code_blocks: true,   // Include code blocks in output
};
```

## Development

```bash
cargo build
cargo test
cargo clippy
```

## License

MIT
