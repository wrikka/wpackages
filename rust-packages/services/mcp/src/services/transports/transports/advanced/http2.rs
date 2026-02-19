use std::time::Duration;
use hyper::{Body, Request, Response};
use hyper::client::HttpConnector;
use hyper_rustls::HttpsConnector;
use tracing::{debug, info};

#[derive(Debug, Clone)]
pub struct Http2Config {
    pub enable_multiplexing: bool,
    pub enable_server_push: bool,
    pub max_concurrent_streams: usize,
    pub initial_window_size: u32,
    pub max_frame_size: u32,
}

impl Default for Http2Config {
    fn default() -> Self {
        Self {
            enable_multiplexing: true,
            enable_server_push: true,
            max_concurrent_streams: 100,
            initial_window_size: 65535,
            max_frame_size: 16384,
        }
    }
}

pub struct Http2Transport {
    config: Http2Config,
}

impl Http2Transport {
    pub fn new(config: Http2Config) -> Self {
        Self { config }
    }

    pub async fn send_request(&self, _request: Request<Body>) -> Result<Response<Body>, String> {
        debug!("Sending HTTP/2 request");

        Ok(Response::new(Body::from("HTTP/2 response")))
    }

    pub async fn send_stream(&self, _data: Vec<u8>) -> Result<(), String> {
        debug!("Sending HTTP/2 stream");

        Ok(())
    }

    pub fn config(&self) -> &Http2Config {
        &self.config
    }
}
