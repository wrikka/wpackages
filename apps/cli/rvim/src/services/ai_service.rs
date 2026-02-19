use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct CompletionRequest {
    prompt: String,
}

#[derive(Deserialize)]
struct CompletionResponse {
    text: String,
}

pub struct AiService {
    client: Client,
    api_key: String,
    endpoint: String,
}

impl AiService {
    pub fn new(api_key: String, endpoint: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            endpoint,
        }
    }

    pub async fn get_completion(&self, prompt: String) -> Result<String> {
        let request = CompletionRequest { prompt };

        let response = self
            .client
            .post(&self.endpoint)
            .bearer_auth(&self.api_key)
            .json(&request)
            .send()
            .await?
            .json::<CompletionResponse>()
            .await?;

        Ok(response.text)
    }
}
