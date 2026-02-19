use tracing_subscriber::{EnvFilter, FmtSubscriber};

pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_max_level(tracing::Level::TRACE)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

pub struct ExtensionMetrics;

impl ExtensionMetrics {
    pub fn record_loaded() {
        tracing::debug!("Extension loaded");
    }

    pub fn record_activated() {
        tracing::debug!("Extension activated");
    }

    pub fn record_load_time(duration_ms: u64) {
        tracing::debug!("Extension loaded in {}ms", duration_ms);
    }

    pub fn record_error(error_type: &str) {
        tracing::error!("Extension error: {}", error_type);
    }

    pub fn set_loaded_count(count: u64) {
        tracing::debug!("Loaded extensions: {}", count);
    }

    pub fn set_active_count(count: u64) {
        tracing::debug!("Active extensions: {}", count);
    }
}

pub struct WebViewMetrics;

impl WebViewMetrics {
    pub fn record_created() {
        tracing::debug!("WebView created");
    }

    pub fn record_closed() {
        tracing::debug!("WebView closed");
    }

    pub fn record_render_time(duration_ms: u64) {
        tracing::debug!("WebView rendered in {}ms", duration_ms);
    }

    pub fn set_active_count(count: u64) {
        tracing::debug!("Active WebViews: {}", count);
    }
}

pub struct EventBusMetrics;

impl EventBusMetrics {
    pub fn record_dispatched(event_type: &str) {
        tracing::debug!("Event dispatched: {}", event_type);
    }

    pub fn record_processing_time(duration_ms: u64) {
        tracing::debug!("Event processed in {}ms", duration_ms);
    }

    pub fn set_listener_count(count: u64) {
        tracing::debug!("Event listeners: {}", count);
    }
}

pub struct MarketplaceMetrics;

impl MarketplaceMetrics {
    pub fn record_search() {
        tracing::debug!("Marketplace search");
    }

    pub fn record_download(extension_id: &str) {
        tracing::debug!("Extension downloaded: {}", extension_id);
    }

    pub fn record_api_latency(endpoint: &str, duration_ms: u64) {
        tracing::debug!("API call to {} took {}ms", endpoint, duration_ms);
    }
}

pub struct LspMetrics;

impl LspMetrics {
    pub fn record_server_started(server_id: &str) {
        tracing::debug!("LSP server started: {}", server_id);
    }

    pub fn record_server_stopped(server_id: &str) {
        tracing::debug!("LSP server stopped: {}", server_id);
    }

    pub fn record_request_latency(request_type: &str, duration_ms: u64) {
        tracing::debug!("LSP request {} took {}ms", request_type, duration_ms);
    }
}

pub struct Timer {
    start: std::time::Instant,
}

impl Timer {
    pub fn new() -> Self {
        Self {
            start: std::time::Instant::now(),
        }
    }

    pub fn record_histogram(self, name: &str) {
        let duration_ms = self.start.elapsed().as_millis() as u64;
        tracing::debug!("{}: {}ms", name, duration_ms);
    }
}

impl Default for Timer {
    fn default() -> Self {
        Self::new()
    }
}

pub fn init_metrics() {
    #[cfg(feature = "metrics")]
    {
        metrics_exporter_prometheus::PrometheusBuilder::new()
            .install()
            .expect("Failed to install Prometheus exporter");
    }
}
