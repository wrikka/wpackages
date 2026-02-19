// HTTP/2 client with connection pooling

use hyper::client::conn::http1::SendRequest;
use hyper::client::conn::http2::Builder as Http2Builder;
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::rt::TokioExecutor;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower::ServiceBuilder;

/// HTTP/2 client with connection pooling
pub struct Http2Client {
    inner: hyper_util::client::legacy::Client<
        hyper_util::client::legacy::connect::HttpConnector,
        hyper::body::Incoming,
    >,
}

impl Http2Client {
    /// Create new HTTP/2 client with connection pooling
    pub fn new() -> Self {
        let connector = HttpConnector::new();

        let client = hyper_util::client::legacy::Client::builder(TokioExecutor::new())
            .pool_idle_timeout(std::time::Duration::from_secs(30))
            .pool_max_idle_per_host(10)
            .http2_only(true)
            .build_http(connector);

        Http2Client { inner: client }
    }

    /// Get request with HTTP/2
    pub async fn get(&self, url: &str) -> Result<String, Box<dyn std::error::Error>> {
        let uri = url.parse()?;
        let resp = self.inner.get(uri).await?;
        let body = hyper::body::collect(resp.into_body()).await?;
        Ok(String::from_utf8(body.to_vec())?)
    }

    /// Put request with HTTP/2
    pub async fn put(
        &self,
        url: &str,
        data: Vec<u8>,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let uri = url.parse()?;
        let req = hyper::Request::builder()
            .uri(uri)
            .method(hyper::Method::PUT)
            .body(hyper::body::Body::from(data))?;

        let resp = self.inner.request(req).await?;
        let body = hyper::body::collect(resp.into_body()).await?;
        Ok(String::from_utf8(body.to_vec())?)
    }

    /// Head request with HTTP/2
    pub async fn head(&self, url: &str) -> Result<hyper::StatusCode, Box<dyn std::error::Error>> {
        let uri = url.parse()?;
        let resp = self.inner.head(uri).await?;
        Ok(resp.status())
    }
}

impl Default for Http2Client {
    fn default() -> Self {
        Self::new()
    }
}

/// Connection pool statistics
#[derive(Debug, Clone)]
pub struct PoolStats {
    pub active_connections: usize,
    pub idle_connections: usize,
    pub max_idle_per_host: usize,
}

/// Get connection pool statistics
pub fn get_pool_stats() -> PoolStats {
    // Stub implementation
    PoolStats {
        active_connections: 0,
        idle_connections: 0,
        max_idle_per_host: 10,
    }
}
