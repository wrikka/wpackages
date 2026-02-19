use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageSummary {
    pub title: String,
    pub url: String,
    pub summary: String,
    pub key_points: Vec<String>,
    pub main_topics: Vec<String>,
    pub entities: Vec<Entity>,
    pub sentiment: Sentiment,
    pub reading_time_minutes: u32,
    pub content_type: ContentType,
    pub language: String,
    pub links: Vec<LinkInfo>,
    pub metadata: PageMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub name: String,
    pub entity_type: String,
    pub relevance_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Sentiment {
    Positive,
    Neutral,
    Negative,
    Mixed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContentType {
    Article,
    ProductPage,
    Documentation,
    BlogPost,
    Forum,
    SocialMedia,
    LandingPage,
    Ecommerce,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkInfo {
    pub text: String,
    pub url: String,
    pub is_external: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageMetadata {
    pub author: Option<String>,
    pub published_date: Option<String>,
    pub modified_date: Option<String>,
    pub description: Option<String>,
    pub keywords: Vec<String>,
    pub og_image: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMConfig {
    pub api_endpoint: String,
    pub api_key: Option<String>,
    pub model: String,
    pub max_tokens: u32,
    pub temperature: f64,
}

impl Default for LLMConfig {
    fn default() -> Self {
        Self {
            api_endpoint: "https://api.openai.com/v1/chat/completions".to_string(),
            api_key: None,
            model: "gpt-3.5-turbo".to_string(),
            max_tokens: 500,
            temperature: 0.3,
        }
    }
}

pub struct PageSummarizer {
    config: LLMConfig,
}

impl PageSummarizer {
    pub fn new(config: LLMConfig) -> Self {
        Self { config }
    }

    pub fn with_api_key(mut self, key: impl Into<String>) -> Self {
        self.config.api_key = Some(key.into());
        self
    }

    pub async fn summarize_page(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<PageSummary> {
        // Get basic page info
        let title_result = browser_manager
            .execute_action(Action::GetTitle, Params::Empty, session_id, headless, datadir, stealth)
            .await?;
        let title = title_result
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        let url_result = browser_manager
            .execute_action(Action::GetUrl, Params::Empty, session_id, headless, datadir, stealth)
            .await?;
        let url = url_result
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        // Extract main content
        let content_js = r#"
            (function() {
                // Remove script and style elements
                const scripts = document.querySelectorAll('script, style, nav, footer, header, aside');
                scripts.forEach(el => el.remove());
                
                // Get text from main content areas
                const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.post', '.entry'];
                let content = '';
                
                for (const selector of mainSelectors) {
                    const el = document.querySelector(selector);
                    if (el) {
                        content = el.innerText;
                        break;
                    }
                }
                
                // Fallback to body if no main content found
                if (!content) {
                    content = document.body.innerText;
                }
                
                // Limit content length
                return content.substring(0, 10000);
            })()
        "#;

        let content_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: content_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let content = content_result
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        // Extract metadata
        let metadata_js = r#"
            (function() {
                const getMeta = (name) => {
                    const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
                    return el ? el.content : null;
                };
                
                return JSON.stringify({
                    author: getMeta('author') || getMeta('article:author'),
                    description: getMeta('description') || getMeta('og:description'),
                    keywords: getMeta('keywords'),
                    published_date: getMeta('article:published_time') || getMeta('publishedDate'),
                    modified_date: getMeta('article:modified_time'),
                    og_image: getMeta('og:image'),
                    language: document.documentElement.lang || 'en'
                });
            })()
        "#;

        let metadata_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: metadata_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let metadata = if let Some(data) = metadata_result {
            if let Some(json_str) = data.as_str() {
                serde_json::from_str::<serde_json::Value>(json_str).unwrap_or_default()
            } else {
                serde_json::Value::Null
            }
        } else {
            serde_json::Value::Null
        };

        // Extract links
        let links_js = r#"
            (function() {
                const links = [];
                const currentHost = window.location.host;
                
                document.querySelectorAll('a[href]').forEach(a => {
                    try {
                        const url = new URL(a.href, window.location.href);
                        links.push({
                            text: a.innerText.substring(0, 100),
                            url: a.href,
                            is_external: url.host !== currentHost
                        });
                    } catch (e) {}
                });
                
                return JSON.stringify(links.slice(0, 50));
            })()
        "#;

        let links_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: links_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let links = if let Some(data) = links_result {
            if let Some(json_str) = data.as_str() {
                serde_json::from_str::<Vec<LinkInfo>>(json_str).unwrap_or_default()
            } else {
                Vec::new()
            }
        } else {
            Vec::new()
        };

        // Generate summary (local implementation without external LLM)
        let summary = self.generate_local_summary(&title, &content);
        let key_points = self.extract_key_points(&content);
        let main_topics = self.extract_topics(&content);
        let entities = self.extract_entities(&content);
        let sentiment = self.analyze_sentiment(&content);
        let content_type = self.detect_content_type(&url, &title, &content);
        let reading_time = self.calculate_reading_time(&content);
        let language = metadata
            .get("language")
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_else(|| "en".to_string());

        Ok(PageSummary {
            title,
            url,
            summary,
            key_points,
            main_topics,
            entities,
            sentiment,
            reading_time_minutes: reading_time,
            content_type,
            language,
            links,
            metadata: PageMetadata {
                author: metadata
                    .get("author")
                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                published_date: metadata
                    .get("published_date")
                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                modified_date: metadata
                    .get("modified_date")
                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                description: metadata
                    .get("description")
                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                keywords: metadata
                    .get("keywords")
                    .and_then(|v| v.as_str().map(|s| {
                        s.split(',').map(|k| k.trim().to_string()).collect()
                    }))
                    .unwrap_or_default(),
                og_image: metadata
                    .get("og_image")
                    .and_then(|v| v.as_str().map(|s| s.to_string())),
            },
        })
    }

    fn generate_local_summary(&self, title: &str, content: &str) -> String {
        // Extract first few sentences as summary
        let sentences: Vec<&str> = content.split('.').filter(|s| s.len() > 20).take(3).collect();
        
        if sentences.is_empty() {
            title.to_string()
        } else {
            sentences.join(". ") + "."
        }
    }

    fn extract_key_points(&self, content: &str) -> Vec<String> {
        let mut points = Vec::new();
        
        // Look for bullet points and numbered lists
        let lines: Vec<&str> = content.lines().collect();
        for line in lines {
            let trimmed = line.trim();
            if trimmed.starts_with("•") || trimmed.starts_with("-") || trimmed.starts_with("*") {
                if trimmed.len() > 10 && trimmed.len() < 200 {
                    points.push(trimmed[1..].trim().to_string());
                }
            }
            // Numbered lists
            if let Some(first) = trimmed.chars().next() {
                if first.is_numeric() && trimmed.chars().nth(1) == Some('.') {
                    if trimmed.len() > 10 && trimmed.len() < 200 {
                        points.push(trimmed[2..].trim().to_string());
                    }
                }
            }
        }
        
        // Limit to top 5 points
        points.truncate(5);
        points
    }

    fn extract_topics(&self, content: &str) -> Vec<String> {
        // Simple topic extraction based on word frequency
        let mut word_counts: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
        
        let words: Vec<&str> = content
            .to_lowercase()
            .split_whitespace()
            .filter(|w| w.len() > 4)
            .collect();
        
        for word in words {
            let clean = word
                .chars()
                .filter(|c| c.is_alphanumeric())
                .collect::<String>();
            if clean.len() > 4 {
                *word_counts.entry(clean).or_insert(0) += 1;
            }
        }
        
        let mut topics: Vec<(String, usize)> = word_counts.into_iter().collect();
        topics.sort_by(|a, b| b.1.cmp(&a.1));
        
        topics
            .into_iter()
            .take(5)
            .map(|(word, _)| word)
            .collect()
    }

    fn extract_entities(&self, content: &str) -> Vec<Entity> {
        let mut entities = Vec::new();
        
        // Simple entity extraction based on capitalization
        let words: Vec<&str> = content.split_whitespace().collect();
        let mut current_entity = String::new();
        
        for word in words {
            let clean: String = word.chars().filter(|c| c.is_alphabetic()).collect();
            if !clean.is_empty() {
                let first_char = clean.chars().next().unwrap();
                if first_char.is_uppercase() && clean.len() > 1 {
                    if !current_entity.is_empty() {
                        current_entity.push(' ');
                    }
                    current_entity.push_str(&clean);
                } else {
                    if current_entity.len() > 3 && current_entity.contains(' ') {
                        entities.push(Entity {
                            name: current_entity.clone(),
                            entity_type: "Unknown".to_string(),
                            relevance_score: 0.5,
                        });
                    }
                    current_entity.clear();
                }
            }
        }
        
        // Deduplicate and limit
        let mut seen = std::collections::HashSet::new();
        entities
            .into_iter()
            .filter(|e| seen.insert(e.name.clone()))
            .take(10)
            .collect()
    }

    fn analyze_sentiment(&self, content: &str) -> Sentiment {
        let positive_words = ["good", "great", "excellent", "amazing", "wonderful", "best", "love", "happy", "success"];
        let negative_words = ["bad", "terrible", "worst", "hate", "awful", "poor", "fail", "error", "problem"];
        
        let content_lower = content.to_lowercase();
        let pos_count = positive_words.iter().filter(|w| content_lower.contains(*w)).count();
        let neg_count = negative_words.iter().filter(|w| content_lower.contains(*w)).count();
        
        match pos_count.cmp(&neg_count) {
            std::cmp::Ordering::Greater => Sentiment::Positive,
            std::cmp::Ordering::Less => Sentiment::Negative,
            std::cmp::Ordering::Equal => Sentiment::Neutral,
        }
    }

    fn detect_content_type(&self, url: &str, title: &str, _content: &str) -> ContentType {
        let url_lower = url.to_lowercase();
        let title_lower = title.to_lowercase();
        
        if url_lower.contains("/product") || url_lower.contains("/item") || url_lower.contains("shop") {
            ContentType::ProductPage
        } else if url_lower.contains("/docs") || url_lower.contains("/documentation") || url_lower.contains("api") {
            ContentType::Documentation
        } else if url_lower.contains("/blog") || url_lower.contains("/post") || url_lower.contains("/article") {
            ContentType::BlogPost
        } else if url_lower.contains("/forum") || url_lower.contains("/topic") || url_lower.contains("/thread") {
            ContentType::Forum
        } else if url_lower.contains("twitter.com") || url_lower.contains("facebook.com") || url_lower.contains("linkedin.com") {
            ContentType::SocialMedia
        } else if url_lower.contains("/cart") || url_lower.contains("/checkout") || url_lower.contains("/buy") {
            ContentType::Ecommerce
        } else if title_lower.contains("landing") || title_lower.contains("home") {
            ContentType::LandingPage
        } else {
            ContentType::Unknown
        }
    }

    fn calculate_reading_time(&self, content: &str) -> u32 {
        let word_count = content.split_whitespace().count();
        let words_per_minute = 200;
        ((word_count as f64 / words_per_minute as f64).ceil() as u32).max(1)
    }
}
