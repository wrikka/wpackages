//! WebView types for custom UI extensions

use crate::types::id::WebviewId;
use serde::{Deserialize, Serialize};

/// Content that can be loaded into a WebView
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WebViewContent {
    /// HTML content as a string
    Html(String),

    /// URL to load
    Url(String),
}

impl WebViewContent {
    /// Creates HTML content
    pub fn html(html: impl Into<String>) -> Self {
        Self::Html(html.into())
    }

    /// Creates URL content
    pub fn url(url: impl Into<String>) -> Self {
        Self::Url(url.into())
    }
}

/// Options for configuring a WebView
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebViewOptions {
    /// Whether to enable JavaScript execution
    pub enable_scripts: bool,

    /// Whether to allow loading local resources
    pub local_resources: bool,

    /// Optional width in pixels
    pub width: Option<u32>,

    /// Optional height in pixels
    pub height: Option<u32>,

    /// Whether to show the WebView (vs hidden)
    pub visible: bool,

    /// Whether to enable dev tools
    pub dev_tools: bool,

    /// Background color (hex format)
    pub background_color: Option<String>,
}

impl Default for WebViewOptions {
    fn default() -> Self {
        Self {
            enable_scripts: true,
            local_resources: true,
            width: None,
            height: None,
            visible: true,
            dev_tools: false,
            background_color: None,
        }
    }
}

impl WebViewOptions {
    /// Creates a new WebViewOptions with default values
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets whether scripts are enabled
    pub fn with_scripts(mut self, enabled: bool) -> Self {
        self.enable_scripts = enabled;
        self
    }

    /// Sets whether local resources are allowed
    pub fn with_local_resources(mut self, allowed: bool) -> Self {
        self.local_resources = allowed;
        self
    }

    /// Sets the width
    pub fn with_width(mut self, width: u32) -> Self {
        self.width = Some(width);
        self
    }

    /// Sets the height
    pub fn with_height(mut self, height: u32) -> Self {
        self.height = Some(height);
        self
    }

    /// Sets the size (width and height)
    pub fn with_size(mut self, width: u32, height: u32) -> Self {
        self.width = Some(width);
        self.height = Some(height);
        self
    }

    /// Sets whether the WebView is visible
    pub fn with_visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }

    /// Sets whether dev tools are enabled
    pub fn with_dev_tools(mut self, enabled: bool) -> Self {
        self.dev_tools = enabled;
        self
    }

    /// Sets the background color
    pub fn with_background_color(mut self, color: impl Into<String>) -> Self {
        self.background_color = Some(color.into());
        self
    }
}

/// Represents a WebView instance
#[derive(Debug, Clone)]
pub struct WebView {
    /// Unique identifier for this WebView
    pub id: WebviewId,

    /// Title of the WebView
    pub title: String,

    /// Content to display
    pub content: WebViewContent,

    /// Configuration options
    pub options: WebViewOptions,
}

impl WebView {
    /// Creates a new WebView
    pub fn new(id: WebviewId, title: impl Into<String>, content: WebViewContent) -> Self {
        Self {
            id,
            title: title.into(),
            content,
            options: WebViewOptions::default(),
        }
    }

    /// Creates a new WebView with custom options
    pub fn with_options(
        id: WebviewId,
        title: impl Into<String>,
        content: WebViewContent,
        options: WebViewOptions,
    ) -> Self {
        Self {
            id,
            title: title.into(),
            content,
            options,
        }
    }

    /// Sets the title
    pub fn with_title(mut self, title: impl Into<String>) -> Self {
        self.title = title.into();
        self
    }

    /// Sets the content
    pub fn with_content(mut self, content: WebViewContent) -> Self {
        self.content = content;
        self
    }

    /// Sets the options
    pub fn set_options(mut self, options: WebViewOptions) -> Self {
        self.options = options;
        self
    }
}

/// Message sent from WebView to extension
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebViewMessage {
    /// ID of the WebView that sent the message
    pub webview_id: WebviewId,

    /// Message type
    pub message_type: String,

    /// Message data
    pub data: serde_json::Value,
}

impl WebViewMessage {
    /// Creates a new WebView message
    pub fn new(
        webview_id: WebviewId,
        message_type: impl Into<String>,
        data: serde_json::Value,
    ) -> Self {
        Self {
            webview_id,
            message_type: message_type.into(),
            data,
        }
    }
}
