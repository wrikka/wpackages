use crate::pipeline::WebSearch;
use crate::spider::SpiderConfig;
use crate::types::{SearchQuery, SearchResult};
use futures::stream::StreamExt;
use std::collections::{HashSet, VecDeque};
use std::sync::Arc;
use url::Url;

pub struct SpiderRunner {
    config: SpiderConfig,
    engine: Arc<WebSearch>,
}

impl SpiderRunner {
    pub fn new(config: SpiderConfig, engine: WebSearch) -> Self {
        Self { config, engine: Arc::new(engine) }
    }

    pub async fn run(&self) -> anyhow::Result<()> {
        tracing::info!("Spider runner started for: {}", self.config.name);
        let mut visited_urls = HashSet::new();
        let mut urls_to_visit = VecDeque::new();
        for url in &self.config.start_urls {
            urls_to_visit.push_back(url.clone());
            visited_urls.insert(url.clone());
        }

        let mut in_progress = futures::stream::FuturesUnordered::new();

        while !urls_to_visit.is_empty() || !in_progress.is_empty() {
            while !urls_to_visit.is_empty() && in_progress.len() < 10 {
                let url = urls_to_visit.pop_front().unwrap();
                tracing::info!("Visiting: {}", url);
                let engine = self.engine.clone();
                in_progress.push(tokio::spawn(async move {
                    let mut query = SearchQuery::new(url.to_string());
                    query.config.deep = true;
                    (url, engine.search(&query).await)
                }));
            }

            match in_progress.next().await {
                Some(Ok((url, Ok(results)))) => {
                    for result in results {
                        if let Some(page) = result.page {
                            let document = scraper::Html::parse_document(&page.html);
                            for rule in &self.config.rules {
                                if let Ok(selector) = scraper::Selector::parse(&rule.link_extractor.restrict_css.join(", ")) {
                                    for element in document.select(&selector) {
                                        if let Some(link) = element.value().attr("href") {
                                            if let Ok(abs_url) = url.join(link) {
                                                if rule.follow && visited_urls.insert(abs_url.clone()) {
                                                    urls_to_visit.push_back(abs_url);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    tracing::error!("Invalid CSS selector in rule");
                                }
                            }
                        }
                    }
                }
                Some(Ok((url, Err(e)))) => {
                    tracing::error!("Failed to fetch URL {}: {}", url, e);
                }
                Some(Err(e)) => {
                    tracing::error!("Task failed: {}", e);
                }
                None => {}
            }
        }

        Ok(())
    }
}
