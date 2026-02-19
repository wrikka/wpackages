//! Adapter for HTML parsing library
//!
//! Wraps `scraper` to provide a consistent interface

use scraper::{Html, Selector};

/// Parse HTML content
///
/// # Arguments
/// * `content` - HTML text content
///
/// # Returns
/// Parsed HTML document
pub fn parse_html(content: &str) -> Html {
    Html::parse_document(content)
}

/// Extract text content from HTML
///
/// # Arguments
/// * `content` - HTML text content
///
/// # Returns
/// Plain text representation
pub fn extract_html_text(content: &str) -> String {
    let document = parse_html(content);
    let body_selector = Selector::parse("body").unwrap();

    document
        .select(&body_selector)
        .next()
        .map(|b| b.text().collect::<String>())
        .unwrap_or_else(|| document.root_element().text().collect())
}

/// Extract title from HTML
///
/// # Arguments
/// * `content` - HTML text content
///
/// # Returns
/// Document title if found
pub fn extract_html_title(content: &str) -> Option<String> {
    let document = parse_html(content);
    let title_selector = Selector::parse("title").unwrap();

    document
        .select(&title_selector)
        .next()
        .map(|t| t.text().collect())
}

/// Extract all headings from HTML
///
/// # Arguments
/// * `content` - HTML text content
///
/// # Returns
/// Vector of (level, text) tuples for each heading
pub fn extract_html_headings(content: &str) -> Vec<(usize, String)> {
    let document = parse_html(content);
    let heading_selector = Selector::parse("h1, h2, h3, h4, h5, h6").unwrap();

    document
        .select(&heading_selector)
        .map(|h| {
            let level = h
                .value()
                .name()
                .chars()
                .last()
                .unwrap()
                .to_digit(10)
                .unwrap() as usize;
            let text = h.text().collect();
            (level, text)
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_html_text() {
        let html = "<html><body><p>Hello</p><p>World</p></body></html>";
        let text = extract_html_text(html);
        assert!(text.contains("Hello"));
        assert!(text.contains("World"));
    }

    #[test]
    fn test_extract_html_title() {
        let html = "<html><head><title>Test Page</title></head></html>";
        let title = extract_html_title(html);
        assert_eq!(title, Some("Test Page".to_string()));
    }

    #[test]
    fn test_extract_html_headings() {
        let html = "<h1>Main</h1><h2>Sub</h2>";
        let headings = extract_html_headings(html);
        assert_eq!(headings.len(), 2);
        assert_eq!(headings[0], (1, "Main".to_string()));
        assert_eq!(headings[1], (2, "Sub".to_string()));
    }
}
