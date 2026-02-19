use crate::error::{ParseError, ParseResult};
use crate::types::{DocumentFormat, ParseOptions, ParsedDocument};
use scraper::{Html, Selector};

pub fn parse_html(content: &str, options: &ParseOptions) -> ParseResult<ParsedDocument> {
    if content.trim().is_empty() {
        return Err(ParseError::EmptyDocument);
    }

    let document = Html::parse_document(content);
    let mut plain_text = String::new();
    let mut sections = Vec::new();
    let mut current_section = String::new();
    let mut current_title: Option<String> = None;

    let title_selector = Selector::parse("title").unwrap();
    if let Some(title) = document.select(&title_selector).next() {
        current_title = Some(title.text().collect::<String>());
    }

    let body_selector = Selector::parse("body").unwrap();
    let body = document.select(&body_selector).next();
    let text_content = body
        .map(|b| b.text().collect::<String>())
        .unwrap_or_else(|| document.root_element().text().collect::<String>());

    plain_text = text_content.clone();

    let heading_selector = Selector::parse("h1, h2, h3, h4, h5, h6").unwrap();
    let mut last_heading: Option<String> = None;
    let mut last_level: Option<usize> = None;

    for heading in document.select(&heading_selector) {
        let level = heading
            .value()
            .name()
            .chars()
            .last()
            .unwrap()
            .to_digit(10)
            .unwrap() as usize;
        let text = heading.text().collect::<String>();

        if let Some(prev_title) = last_heading.take() {
            sections.push(crate::types::DocumentSection {
                title: Some(prev_title),
                content: current_section.clone(),
                level: last_level.take(),
                metadata: None,
            });
            current_section.clear();
        }

        last_heading = Some(text);
        last_level = Some(level);
    }

    if let Some(title) = last_heading {
        sections.push(crate::types::DocumentSection {
            title: Some(title),
            content: current_section,
            level: last_level,
            metadata: None,
        });
    }

    let word_count = plain_text.split_whitespace().count();
    let char_count = plain_text.chars().count();

    Ok(ParsedDocument {
        content: plain_text,
        metadata: crate::types::DocumentMetadata {
            format: DocumentFormat::Html,
            title: current_title,
            author: None,
            created_date: None,
            modified_date: None,
            language: None,
            page_count: None,
            word_count,
            char_count,
        },
        sections: if options.extract_sections {
            sections
        } else {
            Vec::new()
        },
    })
}

pub fn parse_html_file(
    path: &std::path::Path,
    options: &ParseOptions,
) -> ParseResult<ParsedDocument> {
    let content = std::fs::read_to_string(path)?;
    parse_html(&content, options)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_html() {
        let html = "<html><head><title>Test</title></head><body><h1>Heading</h1><p>Content</p></body></html>";
        let result = parse_html(html, &ParseOptions::default()).unwrap();
        assert_eq!(result.metadata.format, DocumentFormat::Html);
        assert_eq!(result.metadata.title, Some("Test".to_string()));
    }
}
