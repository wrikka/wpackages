use anyhow::Result;
use reqwest::{Client, Method, RequestBuilder, Response};
use serde::de::DeserializeOwned;
use std::collections::HashMap;

pub struct ApiClientService {
    client: Client,
}

impl Default for ApiClientService {
    fn default() -> Self {
        Self::new()
    }
}

impl ApiClientService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    pub async fn send_request<T: DeserializeOwned>(
        &self,
        method: Method,
        url: &str,
        headers: Option<HashMap<String, String>>,
        body: Option<String>,
    ) -> Result<T> {
        let mut request_builder = self.client.request(method, url);

        if let Some(h) = headers {
            for (key, value) in h {
                request_builder = request_builder.header(&key, &value);
            }
        }

        if let Some(b) = body {
            request_builder = request_builder.body(b);
        }

        let response = request_builder.send().await?;
        let data = response.json::<T>().await?;
        Ok(data)
    }
}
