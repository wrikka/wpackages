use super::DocumentLoader;
use crate::domain::Document;
use crate::error::{RagError, RagResult};
use async_trait::async_trait;
use scraper::{Html, Selector};


pub struct UrlLoader;

#[async_trait]
impl DocumentLoader for UrlLoader {
    async fn load(&self, url: &str) -> RagResult<Vec<Document>> {
        let response = reqwest::get(url)
            .await
            .map_err(|e| RagError::DocumentLoading(e.to_string()))?;
        let html_content = response
            .text()
            .await
            .map_err(|e| RagError::DocumentLoading(e.to_string()))?;

        let document = Html::parse_document(&html_content);
        let selector = Selector::parse("body").unwrap();
        let text = document
            .select(&selector)
            .map(|element| element.text().collect::<String>())
            .collect::<String>();

        Ok(vec![Document::new(url, text)])
    }
}
