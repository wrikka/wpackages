use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use regex::Regex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookConfig {
    pub id: String,
    pub name: String,
    pub url: String,
    pub method: HttpMethod,
    pub headers: HashMap<String, String>,
    pub events: Vec<String>,
    pub enabled: bool,
    pub retry_config: RetryConfig,
    pub filter_rules: Vec<FilterRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub base_delay_ms: u64,
    pub exponential_backoff: bool,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            base_delay_ms: 1000,
            exponential_backoff: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterRule {
    pub field: String,
    pub operator: FilterOperator,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FilterOperator {
    Equals,
    NotEquals,
    Contains,
    StartsWith,
    EndsWith,
    Regex,
    GreaterThan,
    LessThan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookEvent {
    pub event_type: String,
    pub timestamp: DateTime<Utc>,
    pub session_id: String,
    pub data: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookDelivery {
    pub webhook_id: String,
    pub event: WebhookEvent,
    pub status: DeliveryStatus,
    pub response_status: Option<u16>,
    pub response_body: Option<String>,
    pub attempts: u32,
    pub delivered_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DeliveryStatus {
    Pending,
    Delivered,
    Failed,
    Retrying,
}

#[derive(Debug, Clone)]
pub struct WebhookIntegration {
    configs: HashMap<String, WebhookConfig>,
    delivery_history: Vec<WebhookDelivery>,
}

impl WebhookIntegration {
    pub fn new() -> Self {
        Self {
            configs: HashMap::new(),
            delivery_history: Vec::new(),
        }
    }

    pub fn add_webhook(&mut self, config: WebhookConfig) {
        self.configs.insert(config.id.clone(), config);
    }

    pub fn remove_webhook(&mut self, webhook_id: &str) -> Option<WebhookConfig> {
        self.configs.remove(webhook_id)
    }

    pub fn create_webhook(
        &mut self,
        name: &str,
        url: &str,
        events: Vec<String>,
    ) -> WebhookConfig {
        let config = WebhookConfig {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
            url: url.to_string(),
            method: HttpMethod::Post,
            headers: {
                let mut h = HashMap::new();
                h.insert("Content-Type".to_string(), "application/json".to_string());
                h.insert("User-Agent".to_string(), "browser-use-webhook/1.0".to_string());
                h
            },
            events,
            enabled: true,
            retry_config: RetryConfig::default(),
            filter_rules: Vec::new(),
        };

        self.add_webhook(config.clone());
        config
    }

    pub async fn trigger_event(&mut self, event: WebhookEvent) -> Vec<WebhookDelivery> {
        let mut deliveries = Vec::new();

        for config in self.configs.values().filter(|c| c.enabled && c.events.contains(&event.event_type)) {
            if !self.event_matches_filters(&event, &config.filter_rules) {
                continue;
            }

            let delivery = self.send_webhook(config, &event).await;
            deliveries.push(delivery.clone());
            self.delivery_history.push(delivery);
        }

        deliveries
    }

    fn event_matches_filters(&self, event: &WebhookEvent, filters: &[FilterRule]) -> bool {
        if filters.is_empty() {
            return true;
        }

        filters.iter().all(|rule| {
            let field_value = match rule.field.as_str() {
                "event_type" => Some(event.event_type.clone()),
                "session_id" => Some(event.session_id.clone()),
                _ => event.data.get(&rule.field).and_then(|v| v.as_str()).map(|s| s.to_string()),
            };

            match field_value {
                Some(value) => self.evaluate_filter(&value, &rule.operator, &rule.value),
                None => false,
            }
        })
    }

    fn evaluate_filter(&self, field_value: &str, operator: &FilterOperator, rule_value: &str) -> bool {
        match operator {
            FilterOperator::Equals => field_value == rule_value,
            FilterOperator::NotEquals => field_value != rule_value,
            FilterOperator::Contains => field_value.contains(rule_value),
            FilterOperator::StartsWith => field_value.starts_with(rule_value),
            FilterOperator::EndsWith => field_value.ends_with(rule_value),
            FilterOperator::Regex => {
                Regex::new(rule_value).map(|re| re.is_match(field_value)).unwrap_or(false)
            }
            FilterOperator::GreaterThan => {
                field_value.parse::<f64>().ok().zip(rule_value.parse::<f64>().ok())
                    .map(|(f, r)| f > r).unwrap_or(false)
            }
            FilterOperator::LessThan => {
                field_value.parse::<f64>().ok().zip(rule_value.parse::<f64>().ok())
                    .map(|(f, r)| f < r).unwrap_or(false)
            }
        }
    }

    async fn send_webhook(&self, config: &WebhookConfig, event: &WebhookEvent) -> WebhookDelivery {
        let client = reqwest::Client::new();
        
        let payload = serde_json::json!({
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "session_id": event.session_id,
            "data": event.data,
        });

        let mut request_builder = match config.method {
            HttpMethod::Get => client.get(&config.url),
            HttpMethod::Post => client.post(&config.url),
            HttpMethod::Put => client.put(&config.url),
            HttpMethod::Patch => client.patch(&config.url),
            HttpMethod::Delete => client.delete(&config.url),
        };

        for (key, value) in &config.headers {
            request_builder = request_builder.header(key, value);
        }

        if !matches!(config.method, HttpMethod::Get | HttpMethod::Delete) {
            request_builder = request_builder.json(&payload);
        }

        let mut attempts = 0;
        let mut last_error = None;
        let mut response_status = None;
        let mut response_body = None;

        while attempts < config.retry_config.max_attempts {
            match request_builder.try_clone().unwrap().send().await {
                Ok(response) => {
                    response_status = Some(response.status().as_u16());
                    response_body = response.text().await.ok();
                    
                    if response_status.map(|s| s >= 200 && s < 300).unwrap_or(false) {
                        return WebhookDelivery {
                            webhook_id: config.id.clone(),
                            event: event.clone(),
                            status: DeliveryStatus::Delivered,
                            response_status,
                            response_body,
                            attempts: attempts + 1,
                            delivered_at: Some(Utc::now()),
                            error_message: None,
                        };
                    }
                }
                Err(e) => {
                    last_error = Some(e.to_string());
                }
            }

            attempts += 1;

            if attempts < config.retry_config.max_attempts {
                let delay = if config.retry_config.exponential_backoff {
                    config.retry_config.base_delay_ms * 2u64.pow(attempts - 1)
                } else {
                    config.retry_config.base_delay_ms
                };
                tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
            }
        }

        WebhookDelivery {
            webhook_id: config.id.clone(),
            event: event.clone(),
            status: DeliveryStatus::Failed,
            response_status,
            response_body,
            attempts,
            delivered_at: None,
            error_message: last_error,
        }
    }

    pub fn get_delivery_history(&self, webhook_id: Option<&str>) -> Vec<&WebhookDelivery> {
        self.delivery_history.iter()
            .filter(|d| webhook_id.map(|id| d.webhook_id == id).unwrap_or(true))
            .collect()
    }

    pub fn get_webhook_stats(&self, webhook_id: &str) -> Option<WebhookStats> {
        let deliveries: Vec<&WebhookDelivery> = self.delivery_history.iter()
            .filter(|d| d.webhook_id == webhook_id)
            .collect();

        if deliveries.is_empty() {
            return None;
        }

        let total = deliveries.len();
        let successful = deliveries.iter().filter(|d| matches!(d.status, DeliveryStatus::Delivered)).count();
        let failed = total - successful;
        let success_rate = (successful as f64 / total as f64) * 100.0;

        Some(WebhookStats {
            total_deliveries: total as u32,
            successful_deliveries: successful as u32,
            failed_deliveries: failed as u32,
            success_rate,
            average_attempts: deliveries.iter().map(|d| d.attempts).sum::<u32>() as f64 / total as f64,
        })
    }

    pub fn enable_webhook(&mut self, webhook_id: &str) -> bool {
        if let Some(config) = self.configs.get_mut(webhook_id) {
            config.enabled = true;
            true
        } else {
            false
        }
    }

    pub fn disable_webhook(&mut self, webhook_id: &str) -> bool {
        if let Some(config) = self.configs.get_mut(webhook_id) {
            config.enabled = false;
            true
        } else {
            false
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookStats {
    pub total_deliveries: u32,
    pub successful_deliveries: u32,
    pub failed_deliveries: u32,
    pub success_rate: f64,
    pub average_attempts: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookEventTypes;

impl WebhookEventTypes {
    pub const SESSION_STARTED: &'static str = "session.started";
    pub const SESSION_ENDED: &'static str = "session.ended";
    pub const PAGE_VISITED: &'static str = "page.visited";
    pub const ACTION_PERFORMED: &'static str = "action.performed";
    pub const ACTION_FAILED: &'static str = "action.failed";
    pub const ERROR_OCCURRED: &'static str = "error.occurred";
    pub const SCREENSHOT_TAKEN: &'static str = "screenshot.taken";
    pub const TEST_COMPLETED: &'static str = "test.completed";
    pub const BUDGET_EXCEEDED: &'static str = "budget.exceeded";
}
