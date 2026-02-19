use crate::config::EmbeddingsConfig;
use crate::services::EmbeddingsService;
use crate::types::{Embedding, EmbeddingRequest, EmbeddingResponse};
use pyo3::prelude::*;
use pyo3::types::PyList;
use std::sync::Arc;

#[pyclass]
pub struct Embeddings {
    service: Arc<EmbeddingsService>,
}

#[pymethods]
impl Embeddings {
    #[new]
    fn new(config: &PyAny) -> PyResult<Self> {
        let config: EmbeddingsConfig = serde_json::from_str(config.str()?.to_str()?).map_err(|e| {
            pyo3::exceptions::PyValueError::new_err(format!("Failed to parse config: {}", e))
        })?;
        let service = Arc::new(pyo3_asyncio::tokio::get_runtime().block_on(EmbeddingsService::new(config)).map_err(|e| {
            pyo3::exceptions::PyValueError::new_err(format!("Failed to create service: {}", e))
        })?);
        Ok(Self { service })
    }

    fn embed_text<'p>(&self, py: Python<'p>, texts: Vec<String>) -> PyResult<&'p PyAny> {
        let service = self.service.clone();
        pyo3_asyncio::tokio::future_into_py(py, async move {
            let embeddings = service.embed_text_batch(texts).await.map_err(|e| {
                pyo3::exceptions::PyValueError::new_err(format!("Failed to embed text: {}", e))
            })?;
            Ok(Python::with_gil(|py| PyList::new(py, embeddings)))
        })
    }
}

