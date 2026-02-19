use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};
use regex::Regex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieRule {
    pub domain_pattern: String,
    pub name_pattern: Option<String>,
    pub action: CookieAction,
    pub ttl_days: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CookieAction {
    Allow,
    Block,
    ExpireAfterDays(i64),
    Anonymize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManagedCookie {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub expires: Option<DateTime<Utc>>,
    pub secure: bool,
    pub http_only: bool,
    pub same_site: Option<String>,
    pub category: CookieCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CookieCategory {
    Necessary,
    Functional,
    Analytics,
    Marketing,
    Uncategorized,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookiePolicy {
    pub name: String,
    pub description: String,
    pub rules: Vec<CookieRule>,
    pub auto_clean_interval_hours: u64,
    pub gdpr_compliant: bool,
}

#[derive(Debug, Clone)]
pub struct SmartCookieManager {
    cookies: HashMap<String, Vec<ManagedCookie>>,
    policy: CookiePolicy,
    last_cleanup: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieStats {
    pub total_cookies: usize,
    pub by_category: HashMap<String, usize>,
    pub by_domain: HashMap<String, usize>,
    pub expired_cookies: usize,
    pub third_party_cookies: usize,
}

impl SmartCookieManager {
    pub fn new(policy: CookiePolicy) -> Self {
        Self {
            cookies: HashMap::new(),
            policy,
            last_cleanup: Utc::now(),
        }
    }

    pub fn with_gdpr_policy() -> Self {
        let policy = CookiePolicy {
            name: "GDPR Compliant".to_string(),
            description: "Privacy-focused cookie management".to_string(),
            rules: vec![
                CookieRule {
                    domain_pattern: "*".to_string(),
                    name_pattern: None,
                    action: CookieAction::Anonymize,
                    ttl_days: Some(30),
                },
                CookieRule {
                    domain_pattern: "google-analytics.com".to_string(),
                    name_pattern: None,
                    action: CookieAction::Block,
                    ttl_days: None,
                },
                CookieRule {
                    domain_pattern: "doubleclick.net".to_string(),
                    name_pattern: None,
                    action: CookieAction::Block,
                    ttl_days: None,
                },
            ],
            auto_clean_interval_hours: 24,
            gdpr_compliant: true,
        };

        Self::new(policy)
    }

    pub fn add_cookie(&mut self, session_id: &str, cookie: ManagedCookie) {
        let action = self.determine_action(&cookie);
        
        let managed_cookie = match action {
            CookieAction::Block => {
                return;
            }
            CookieAction::Anonymize => {
                ManagedCookie {
                    value: self.anonymize_value(&cookie.value),
                    ..cookie
                }
            }
            CookieAction::ExpireAfterDays(days) => {
                ManagedCookie {
                    expires: Some(Utc::now() + Duration::days(days)),
                    ..cookie
                }
            }
            _ => cookie,
        };

        let session_cookies = self.cookies.entry(session_id.to_string()).or_insert_with(Vec::new);
        
        session_cookies.retain(|c| !(c.name == managed_cookie.name && c.domain == managed_cookie.domain));
        session_cookies.push(managed_cookie);
    }

    fn determine_action(&self, cookie: &ManagedCookie) -> CookieAction {
        for rule in &self.policy.rules {
            if self.matches_pattern(&cookie.domain, &rule.domain_pattern) {
                if let Some(ref name_pattern) = rule.name_pattern {
                    if !self.matches_pattern(&cookie.name, name_pattern) {
                        continue;
                    }
                }
                return rule.action.clone();
            }
        }

        CookieAction::Allow
    }

    fn matches_pattern(&self, value: &str, pattern: &str) -> bool {
        if pattern == "*" {
            return true;
        }
        
        if let Ok(regex) = Regex::new(&format!("^{}$", pattern.replace("*", ".*"))) {
            regex.is_match(value)
        } else {
            value.contains(pattern)
        }
    }

    fn anonymize_value(&self, value: &str) -> String {
        format!("anon_{}", uuid::Uuid::new_v4().to_string().replace("-", &value.get(0..4).unwrap_or("xxxx").to_string())[..8].to_string())
    }

    pub fn get_cookies(&self, session_id: &str, domain: Option<&str>) -> Vec<&ManagedCookie> {
        self.cookies.get(session_id)
            .map(|cookies| {
                cookies.iter()
                    .filter(|c| domain.map(|d| c.domain.contains(d)).unwrap_or(true))
                    .filter(|c| c.expires.map(|e| e > Utc::now()).unwrap_or(true))
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn delete_cookie(&mut self, session_id: &str, name: &str, domain: &str) -> bool {
        if let Some(cookies) = self.cookies.get_mut(session_id) {
            let initial_len = cookies.len();
            cookies.retain(|c| !(c.name == name && c.domain == domain));
            cookies.len() < initial_len
        } else {
            false
        }
    }

    pub fn clear_session(&mut self, session_id: &str) {
        self.cookies.remove(session_id);
    }

    pub fn cleanup_expired(&mut self) -> usize {
        let now = Utc::now();
        let mut total_removed = 0;

        for cookies in self.cookies.values_mut() {
            let initial_len = cookies.len();
            cookies.retain(|c| c.expires.map(|e| e > now).unwrap_or(true));
            total_removed += initial_len - cookies.len();
        }

        self.last_cleanup = now;
        total_removed
    }

    pub fn get_stats(&self, session_id: &str) -> CookieStats {
        let cookies = self.cookies.get(session_id).cloned().unwrap_or_default();
        let now = Utc::now();

        let mut by_category: HashMap<String, usize> = HashMap::new();
        let mut by_domain: HashMap<String, usize> = HashMap::new();
        let mut expired = 0;
        let mut third_party = 0;

        for cookie in &cookies {
            let category = format!("{:?}", cookie.category).to_lowercase();
            *by_category.entry(category).or_insert(0) += 1;
            *by_domain.entry(cookie.domain.clone()).or_insert(0) += 1;

            if cookie.expires.map(|e| e <= now).unwrap_or(false) {
                expired += 1;
            }

            if cookie.domain.starts_with('.') || cookie.domain.contains("doubleclick") 
                || cookie.domain.contains("google-analytics") || cookie.domain.contains("facebook") {
                third_party += 1;
            }
        }

        CookieStats {
            total_cookies: cookies.len(),
            by_category,
            by_domain,
            expired_cookies: expired,
            third_party_cookies: third_party,
        }
    }

    pub fn export_cookies(&self, session_id: &str) -> String {
        let cookies = self.get_cookies(session_id, None);
        serde_json::to_string_pretty(&cookies).unwrap_or_default()
    }

    pub fn import_cookies(&mut self, session_id: &str, json: &str) -> anyhow::Result<()> {
        let imported: Vec<ManagedCookie> = serde_json::from_str(json)?;
        for cookie in imported {
            self.add_cookie(session_id, cookie);
        }
        Ok(())
    }

    pub fn generate_consent_banner(&self) -> String {
        r#"
        <div id="cookie-consent" style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 20px; z-index: 9999;">
            <p>We use cookies to improve your experience. By continuing to use our site, you agree to our use of cookies.</p>
            <button onclick="acceptCookies()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; margin-right: 10px;">Accept All</button>
            <button onclick="rejectCookies()" style="background: #f44336; color: white; padding: 10px 20px; border: none; cursor: pointer;">Reject Non-Essential</button>
        </div>
        <script>
            function acceptCookies() {
                document.cookie = "cookie_consent=accepted; path=/; max-age=" + (365 * 24 * 60 * 60);
                document.getElementById('cookie-consent').style.display = 'none';
            }
            function rejectCookies() {
                document.cookie = "cookie_consent=rejected; path=/; max-age=" + (365 * 24 * 60 * 60);
                document.getElementById('cookie-consent').style.display = 'none';
            }
        </script>
        "#.to_string()
    }
}
