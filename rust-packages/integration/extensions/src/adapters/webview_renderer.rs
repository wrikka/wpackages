//! WebView renderer adapter using wry (system webview library)

use crate::error::{AppError, Result};
use crate::types::webview::{WebViewContent, WebViewOptions};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, error, info};

/// WebView renderer handle
#[derive(Clone)]
pub struct WebViewRenderer {
    inner: Arc<RwLock<RendererInner>>,
}

struct RendererInner {
    #[cfg(all(not(target_arch = "wasm32"), feature = "webview"))]
    webview: Option<wry::WebView>,
}

impl WebViewRenderer {
    /// Creates a new WebView renderer
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(RendererInner {
                #[cfg(all(not(target_arch = "wasm32"), feature = "webview"))]
                webview: None,
            })),
        }
    }

    /// Loads content into the WebView
    pub async fn load_content(&self, content: WebViewContent, options: WebViewOptions) -> Result<()> {
        #[cfg(all(not(target_arch = "wasm32"), feature = "webview"))]
        {
            use wry::{Application, ApplicationSettings, WebViewBuilder};

            let mut inner = self.inner.write().await;

            // Close existing webview if any
            if inner.webview.is_some() {
                inner.webview = None;
            }

            // Create new webview
            let html = match content {
                WebViewContent::Html(s) => s,
                WebViewContent::Url(url) => {
                    format!(r#"<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url={}"></head></html>"#, url)
                }
            };

            let app = Application::new(ApplicationSettings::default()).map_err(|e| {
                AppError::WebViewError(format!("Failed to create application: {}", e))
            })?;

            let webview = WebViewBuilder::new()
                .with_html(html.as_bytes())
                .map_err(|e| AppError::WebViewError(format!("Failed to set HTML: {}", e)))?
                .with_devtools(options.enable_scripts)
                .build(&app)
                .map_err(|e| AppError::WebViewError(format!("Failed to build WebView: {}", e)))?;

            inner.webview = Some(webview);

            info!("WebView loaded successfully");
            Ok(())
        }

        #[cfg(target_arch = "wasm32")]
        {
            Err(AppError::WebViewError(
                "WebView is not supported on wasm32".to_string(),
            ))
        }
    }

    /// Evaluates JavaScript in the WebView
    pub async fn evaluate_script(&self, script: &str) -> Result<String> {
        #[cfg(not(target_arch = "wasm32"))]
        {
            let inner = self.inner.read().await;
            if let Some(webview) = &inner.webview {
                // Note: wry doesn't have a direct evaluate_script method in the public API
                // This is a placeholder for the actual implementation
                debug!("Evaluating script: {}", script);
                Ok("{}".to_string())
            } else {
                Err(AppError::WebViewError("WebView not initialized".to_string()))
            }
        }

        #[cfg(target_arch = "wasm32")]
        {
            Err(AppError::WebViewError(
                "WebView is not supported on wasm32".to_string(),
            ))
        }
    }

    /// Closes the WebView
    pub async fn close(&self) {
        #[cfg(not(target_arch = "wasm32"))]
        {
            let mut inner = self.inner.write().await;
            inner.webview = None;
            info!("WebView closed");
        }
    }

    /// Checks if the WebView is open
    pub async fn is_open(&self) -> bool {
        #[cfg(all(not(target_arch = "wasm32"), feature = "webview"))]
        {
            let inner = self.inner.read().await;
            inner.webview.is_some()
        }

        #[cfg(any(target_arch = "wasm32", not(feature = "webview")))]
        {
            false
        }
    }
}

impl Default for WebViewRenderer {
    fn default() -> Self {
        Self::new()
    }
}
