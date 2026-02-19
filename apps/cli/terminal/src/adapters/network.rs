//! Network Adapter
//!
//! Wrapper for HTTP client operations

use reqwest::Client;
use reqwest::Error as ReqwestError;

pub struct NetworkAdapter {
    client: Client,
}

impl NetworkAdapter {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    pub async fn get(&self, url: &str) -> Result<String, ReqwestError> {
        let response = self.client.get(url).send().await?;
        response.text().await
    }

    pub async fn post(&self, url: &str, body: &str) -> Result<String, ReqwestError> {
        let response = self.client.post(url).body(body.to_string()).send().await?;
        response.text().await
    }
}

impl Default for NetworkAdapter {
    fn default() -> Self {
        Self::new()
    }
}
