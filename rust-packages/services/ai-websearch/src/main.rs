use websearch::spider::{SpiderConfig, SpiderRunner, Rule, LinkExtractor, SpiderSettings};
use websearch::pipeline::WebSearch;
use url::Url;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let config = SpiderConfig {
        name: "example".to_string(),
        start_urls: vec![Url::parse("http://example.com")?],
        rules: vec![Rule {
            link_extractor: LinkExtractor {
                allow: vec![],
                deny: vec![],
                restrict_css: vec!["a".to_string()],
            },
            callback: "".to_string(),
            follow: true,
        }],
        settings: SpiderSettings::default(),
    };

    let engine = WebSearch::new();
    let runner = SpiderRunner::new(config, engine);
    runner.run().await?;

    Ok(())
}
