use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockRule {
    pub id: String,
    pub url_pattern: String,
    pub method: String,
    pub response: MockResponse,
    pub delay_ms: u64,
    pub enabled: bool,
    pub priority: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub body_type: BodyType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BodyType {
    Json,
    Text,
    Html,
    Xml,
    Binary,
}

#[derive(Debug, Clone)]
pub struct ApiMocking {
    rules: HashMap<String, MockRule>,
}

impl ApiMocking {
    pub fn new() -> Self {
        Self {
            rules: HashMap::new(),
        }
    }

    pub fn add_rule(&mut self, rule: MockRule) {
        self.rules.insert(rule.id.clone(), rule);
    }

    pub fn remove_rule(&mut self, rule_id: &str) -> Option<MockRule> {
        self.rules.remove(rule_id)
    }

    pub fn enable_rule(&mut self, rule_id: &str) -> bool {
        if let Some(rule) = self.rules.get_mut(rule_id) {
            rule.enabled = true;
            true
        } else {
            false
        }
    }

    pub fn disable_rule(&mut self, rule_id: &str) -> bool {
        if let Some(rule) = self.rules.get_mut(rule_id) {
            rule.enabled = false;
            true
        } else {
            false
        }
    }

    pub fn match_request(&self, url: &str, method: &str) -> Option<MockRule> {
        let mut matches: Vec<&MockRule> = self.rules.values()
            .filter(|r| r.enabled)
            .filter(|r| {
                let pattern_matches = self.url_matches(&r.url_pattern, url);
                let method_matches = r.method == "*" || r.method.eq_ignore_ascii_case(method);
                pattern_matches && method_matches
            })
            .collect();

        matches.sort_by(|a, b| b.priority.cmp(&a.priority));

        matches.first().cloned().cloned()
    }

    fn url_matches(&self, pattern: &str, url: &str) -> bool {
        if let Ok(regex) = Regex::new(&format!("^{}$", pattern)) {
            regex.is_match(url)
        } else {
            pattern == "*" || url.contains(pattern)
        }
    }

    pub fn generate_mock_script(&self) -> String {
        let rules_json = serde_json::to_string_pretty(&self.rules).unwrap_or_default();
        format!(
            r#"
            const mockRules = {};
            
            const originalFetch = window.fetch;
            window.fetch = async function(url, options) {{
                const method = options?.method || 'GET';
                
                for (const rule of Object.values(mockRules)) {{
                    if (!rule.enabled) continue;
                    
                    const pattern = new RegExp('^' + rule.url_pattern + '$');
                    if (pattern.test(url) && (rule.method === '*' || rule.method === method)) {{
                        await new Promise(r => setTimeout(r, rule.delay_ms));
                        
                        return new Response(rule.response.body, {{
                            status: rule.response.status,
                            headers: rule.response.headers
                        }});
                    }}
                }}
                
                return originalFetch(url, options);
            }};
            "#,
            rules_json
        )
    }

    pub fn create_json_mock(url_pattern: &str, data: &str) -> MockRule {
        let mut headers = HashMap::new();
        headers.insert("Content-Type".to_string(), "application/json".to_string());

        MockRule {
            id: uuid::Uuid::new_v4().to_string(),
            url_pattern: url_pattern.to_string(),
            method: "GET".to_string(),
            response: MockResponse {
                status: 200,
                headers,
                body: data.to_string(),
                body_type: BodyType::Json,
            },
            delay_ms: 0,
            enabled: true,
            priority: 0,
        }
    }

    pub fn create_error_mock(url_pattern: &str, status: u16, message: &str) -> MockRule {
        let mut headers = HashMap::new();
        headers.insert("Content-Type".to_string(), "application/json".to_string());

        MockRule {
            id: uuid::Uuid::new_v4().to_string(),
            url_pattern: url_pattern.to_string(),
            method: "*".to_string(),
            response: MockResponse {
                status,
                headers,
                body: format!("{{\"error\": \"{}\"}}", message),
                body_type: BodyType::Json,
            },
            delay_ms: 0,
            enabled: true,
            priority: 10,
        }
    }

    pub fn list_rules(&self) -> Vec<MockRule> {
        self.rules.values().cloned().collect()
    }

    pub fn clear(&mut self) {
        self.rules.clear();
    }
}
