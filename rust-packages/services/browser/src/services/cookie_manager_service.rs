use crate::error::Result;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cookie {
    pub name: String,
    pub value: String,
    pub domain: Option<String>,
    pub path: Option<String>,
    pub expires: Option<DateTime<Utc>>,
    pub secure: bool,
    pub http_only: bool,
    pub same_site: Option<String>,
}

impl Cookie {
    pub fn new(name: impl Into<String>, value: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            value: value.into(),
            domain: None,
            path: None,
            expires: None,
            secure: false,
            http_only: false,
            same_site: None,
        }
    }

    pub fn with_domain(mut self, domain: impl Into<String>) -> Self {
        self.domain = Some(domain.into());
        self
    }

    pub fn with_path(mut self, path: impl Into<String>) -> Self {
        self.path = Some(path.into());
        self
    }

    pub fn with_secure(mut self, secure: bool) -> Self {
        self.secure = secure;
        self
    }

    pub fn with_http_only(mut self, http_only: bool) -> Self {
        self.http_only = http_only;
        self
    }
}

#[async_trait]
pub trait CookieManagerService: Send + Sync {
    async fn get_all(&self, session_id: &str) -> Result<Vec<Cookie>>;
    async fn get(&self, session_id: &str, name: &str) -> Result<Option<Cookie>>;
    async fn set(&self, session_id: &str, cookie: &Cookie) -> Result<()>;
    async fn delete(&self, session_id: &str, name: &str) -> Result<()>;
    async fn clear_all(&self, session_id: &str) -> Result<()>;
    async fn export(&self, session_id: &str) -> Result<String>;
    async fn import(&self, session_id: &str, cookies_json: &str) -> Result<()>;
}
