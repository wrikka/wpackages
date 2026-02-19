use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalModel {
    pub id: String,
    pub name: String,
    pub size_mb: u64,
    pub quantization: Quantization,
    pub is_downloaded: bool,
    pub is_loaded: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Quantization {
    Fp16,
    Q8_0,
    Q4_K,
    Q4_0,
    Q3_K,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionRequest {
    pub prompt: String,
    pub max_tokens: usize,
    pub temperature: f32,
    pub context: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionResponse {
    pub text: String,
    pub confidence: f32,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Default)]
pub struct OfflineAiState {
    pub models: Vec<LocalModel>,
    pub active_model: Option<String>,
    pub is_enabled: bool,
    pub use_local_when_available: bool,
    pub fallback_to_cloud: bool,
    pub gpu_acceleration: bool,
}

impl OfflineAiState {
    pub fn new() -> Self {
        Self {
            models: vec![
                LocalModel {
                    id: "codellama-7b".to_string(),
                    name: "Code Llama 7B".to_string(),
                    size_mb: 3800,
                    quantization: Quantization::Q4_K,
                    is_downloaded: false,
                    is_loaded: false,
                },
                LocalModel {
                    id: "deepseek-coder-6.7b".to_string(),
                    name: "DeepSeek Coder 6.7B".to_string(),
                    size_mb: 4000,
                    quantization: Quantization::Q4_K,
                    is_downloaded: false,
                    is_loaded: false,
                },
            ],
            active_model: None,
            is_enabled: true,
            use_local_when_available: true,
            fallback_to_cloud: true,
            gpu_acceleration: true,
        }
    }

    pub fn add_model(&mut self, model: LocalModel) {
        self.models.push(model);
    }

    pub fn remove_model(&mut self, id: &str) {
        self.models.retain(|m| m.id != id);
    }

    pub fn select_model(&mut self, id: String) {
        self.active_model = Some(id);
    }

    pub fn download_model(&mut self, id: &str) {
        if let Some(model) = self.models.iter_mut().find(|m| m.id == id) {
            model.is_downloaded = true;
        }
    }

    pub fn load_model(&mut self, id: &str) {
        if let Some(model) = self.models.iter_mut().find(|m| m.id == id) {
            model.is_loaded = true;
        }
    }

    pub fn unload_model(&mut self, id: &str) {
        if let Some(model) = self.models.iter_mut().find(|m| m.id == id) {
            model.is_loaded = false;
        }
    }

    pub fn get_active_model(&self) -> Option<&LocalModel> {
        self.active_model.as_ref()
            .and_then(|id| self.models.iter().find(|m| m.id == *id))
    }
}
