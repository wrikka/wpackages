//! Integration tests for document-parsers
//!
//! These tests verify the end-to-end functionality of the parsers.

use document_parsers::{
    parse_code, parse_html, parse_markdown, parse_pdf, parse_text,
    types::{DocumentFormat, ParseOptions},
};

#[test]
fn test_parse_markdown_integration() {
    let markdown = r#"# Document Title

This is a paragraph.

## Section 1

Content for section 1.

```rust
fn main() {
    println!("Hello, world!");
}
```

## Section 2

More content.
"#;

    let options = ParseOptions::default();
    let result = parse_markdown(markdown, &options);

    assert!(result.is_ok());
    let doc = result.unwrap();
    assert_eq!(doc.metadata.format, DocumentFormat::Markdown);
    assert!(doc.content.contains("Document Title"));
    assert!(doc.content.contains("Hello, world!"));
    assert!(!doc.sections.is_empty());
}

#[test]
fn test_parse_html_integration() {
    let html = r#"<!DOCTYPE html>
<html>
<head>
    <title>Test Document</title>
</head>
<body>
    <h1>Main Heading</h1>
    <p>This is a paragraph.</p>
    <p>Another paragraph.</p>
</body>
</html>"#;

    let options = ParseOptions::default();
    let result = parse_html(html, &options);

    assert!(result.is_ok());
    let doc = result.unwrap();
    assert_eq!(doc.metadata.format, DocumentFormat::Html);
    assert!(doc.content.contains("Main Heading"));
}

#[test]
fn test_parse_text_integration() {
    let text =
        "This is a simple text document.\n\nIt has multiple paragraphs.\n\nAnd some content.";

    let options = ParseOptions::default();
    let result = parse_text(text, &options);

    assert!(result.is_ok());
    let doc = result.unwrap();
    assert_eq!(doc.metadata.format, DocumentFormat::Text);
    assert!(doc.content.contains("simple text document"));
}

#[test]
fn test_parse_code_integration() {
    let code = r#"fn main() {
    // This is a comment
    println!("Hello, world!");
}

fn helper() -> i32 {
    42
}"#;

    let options = ParseOptions::default();
    let result = parse_code(code, "rs", &options);

    assert!(result.is_ok());
    let doc = result.unwrap();
    assert_eq!(doc.metadata.format, DocumentFormat::Code);
    assert!(doc.content.contains("fn main"));
}

#[test]
fn test_parse_options_sections() {
    let markdown = "# Title\n\nContent";

    let mut options = ParseOptions::default();
    options.extract_sections = false;

    let result = parse_markdown(markdown, &options);
    assert!(result.is_ok());
    let doc = result.unwrap();
    assert!(doc.sections.is_empty());
}

#[test]
fn test_parse_options_code_blocks() {
    let markdown = "```rust\nfn test() {}\n```";

    let mut options = ParseOptions::default();
    options.include_code_blocks = false;

    let result = parse_markdown(markdown, &options);
    assert!(result.is_ok());
    let doc = result.unwrap();
    // Code blocks should not be included
    assert!(!doc.content.contains("fn test"));
}

#[test]
fn test_empty_document_error() {
    let result = parse_markdown("", &ParseOptions::default());
    assert!(result.is_err());
}

#[test]
fn test_document_format_detection() {
    assert_eq!(DocumentFormat::from_extension("pdf"), DocumentFormat::Pdf);
    assert_eq!(
        DocumentFormat::from_extension("md"),
        DocumentFormat::Markdown
    );
    assert_eq!(DocumentFormat::from_extension("html"), DocumentFormat::Html);
    assert_eq!(DocumentFormat::from_extension("txt"), DocumentFormat::Text);
    assert_eq!(DocumentFormat::from_extension("rs"), DocumentFormat::Code);
    assert_eq!(
        DocumentFormat::from_extension("unknown"),
        DocumentFormat::Unknown
    );
}
