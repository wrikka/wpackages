//! WebView service for managing WebView instances

use crate::error::{AppError, Result};
use crate::types::event::{EventListener, ExtensionEvent};
use crate::types::webview::{WebView, WebViewContent, WebViewMessage, WebViewOptions};
use crate::types::WebviewId;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info};

/// Placeholder for WebViewRenderer when webview feature is not enabled
#[derive(Clone)]
struct WebViewRenderer;

impl WebViewRenderer {
    fn new() -> Self {
        Self
    }

    fn load_content(&self, _content: WebViewContent, _options: WebViewOptions) -> Result<()> {
        Ok(())
    }

    fn evaluate_script(&self, _script: &str) -> Result<String> {
        Ok("".to_string())
    }

    fn close(&self) -> Result<()> {
        Ok(())
    }
}

/// Service for managing WebView instances
#[derive(Clone)]
pub struct WebViewService {
    webviews: Arc<RwLock<HashMap<WebviewId, WebViewInstance>>>,
    event_bus: Option<crate::services::event_bus::EventBus>,
}

struct WebViewInstance {
    webview: WebView,
    renderer: WebViewRenderer,
}

impl WebViewService {
    /// Creates a new WebViewService
    pub fn new() -> Self {
        Self {
            webviews: Arc::new(RwLock::new(HashMap::new())),
            event_bus: None,
        }
    }

    /// Sets the event bus for WebView events
    pub fn with_event_bus(mut self, event_bus: crate::services::event_bus::EventBus) -> Self {
        self.event_bus = Some(event_bus);
        self
    }

    /// Creates a new WebView
    pub async fn create_webview(&self, webview: WebView) -> Result<WebviewId> {
        let id = webview.id.clone();
        debug!("Creating WebView: {}", id);

        let renderer = WebViewRenderer::new();
        renderer.load_content(webview.content.clone(), webview.options.clone())?;

        let instance = WebViewInstance {
            webview: webview.clone(),
            renderer,
        };

        let mut webviews = self.webviews.write().await;
        webviews.insert(id.clone(), instance);

        if let Some(ref event_bus) = self.event_bus {
            event_bus
                .dispatch(ExtensionEvent::WebViewCreated {
                    webview_id: id.to_string(),
                })
                .await;
        }

        info!("WebView {} created successfully", id);
        Ok(id)
    }

    /// Loads content into an existing WebView
    pub async fn load_content(
        &self,
        webview_id: &WebviewId,
        content: WebViewContent,
    ) -> Result<()> {
        debug!("Loading content into WebView: {}", webview_id);

        let mut webviews = self.webviews.write().await;
        if let Some(instance) = webviews.get_mut(webview_id) {
            instance.webview.content = content.clone();
            drop(webviews);

            let webviews = self.webviews.read().await;
            if let Some(instance) = webviews.get(webview_id) {
                instance
                    .renderer
                    .load_content(content, instance.webview.options.clone())?;
                return Ok(());
            }
        }

        Err(AppError::WebViewNotFound(webview_id.to_string()))
    }

    /// Evaluates JavaScript in a WebView
    pub async fn evaluate_script(&self, webview_id: &WebviewId, script: &str) -> Result<String> {
        debug!("Evaluating script in WebView: {}", webview_id);

        let webviews = self.webviews.read().await;
        if let Some(instance) = webviews.get(webview_id) {
            instance.renderer.evaluate_script(script)
        } else {
            Err(AppError::WebViewNotFound(webview_id.to_string()))
        }
    }

    /// Sends a message to a WebView
    pub async fn send_message(
        &self,
        webview_id: &WebviewId,
        message: WebViewMessage,
    ) -> Result<()> {
        debug!("Sending message to WebView: {}", webview_id);

        let js = format!(
            "window.receiveMessage({});",
            serde_json::to_string(&message.data)?
        );
        self.evaluate_script(webview_id, &js).await?;
        Ok(())
    }

    /// Closes a WebView
    pub async fn close_webview(&self, webview_id: &WebviewId) -> Result<()> {
        debug!("Closing WebView: {}", webview_id);

        let mut webviews = self.webviews.write().await;
        if let Some(instance) = webviews.remove(webview_id) {
            let _ = instance.renderer.close();

            if let Some(ref event_bus) = self.event_bus {
                event_bus
                    .dispatch(ExtensionEvent::WebViewClosed {
                        webview_id: webview_id.to_string(),
                    })
                    .await;
            }

            info!("WebView {} closed", webview_id);
            Ok(())
        } else {
            Err(AppError::WebViewNotFound(webview_id.to_string()))
        }
    }

    /// Gets a WebView by ID
    pub async fn get_webview(&self, webview_id: &WebviewId) -> Option<WebView> {
        let webviews = self.webviews.read().await;
        webviews
            .get(webview_id)
            .map(|instance| instance.webview.clone())
    }

    /// Gets all WebView IDs
    pub async fn list_webviews(&self) -> Vec<WebviewId> {
        let webviews = self.webviews.read().await;
        webviews.keys().cloned().collect()
    }

    /// Checks if a WebView exists
    pub async fn webview_exists(&self, webview_id: &WebviewId) -> bool {
        let webviews = self.webviews.read().await;
        webviews.contains_key(webview_id)
    }

    /// Closes all WebViews
    pub async fn close_all(&self) {
        debug!("Closing all WebViews");

        let mut webviews = self.webviews.write().await;
        for (id, instance) in webviews.drain() {
            let _ = instance.renderer.close();

            if let Some(ref event_bus) = self.event_bus {
                event_bus
                    .dispatch(ExtensionEvent::WebViewClosed {
                        webview_id: id.to_string(),
                    })
                    .await;
            }
        }

        info!("All WebViews closed");
    }
}

impl Default for WebViewService {
    fn default() -> Self {
        Self::new()
    }
}

/// Event listener for WebView messages
pub struct WebViewMessageListener {
    _webview_service: WebViewService,
}

impl WebViewMessageListener {
    pub fn new(webview_service: WebViewService) -> Self {
        Self {
            _webview_service: webview_service,
        }
    }
}

impl EventListener for WebViewMessageListener {
    fn on_event(&self, event: ExtensionEvent) {
        if let ExtensionEvent::WebViewMessage {
            webview_id,
            message,
        } = event
        {
            debug!(
                "Received WebView message from {}: {:?}",
                webview_id, message
            );
        }
    }
}
