use crate::types::{SearchQuery, SearchResult};

#[derive(Default)]
pub struct WebSearch;

impl WebSearch {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn search(&self, query: &SearchQuery) -> anyhow::Result<Vec<SearchResult>> {
        println!("Searching for: {}", query.query);
        let page = crate::types::Page {
            html: "<html><body><a href=\"http://example.com/page2\">Page 2</a></body></html>".to_string(),
            title: Some("Example Page".to_string()),
        };
        let result = SearchResult {
            url: query.query.clone(),
            title: Some("Example Page".to_string()),
            page: Some(page),
        };
        Ok(vec![result])
    }
}
