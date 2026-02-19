use crate::error::{AppError, AppResult};
use crate::services::cache::get_cache_path;
use blake3;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION};
use reqwest::{Body, Client, StatusCode};
use serde_json;
use std::path::Path;
use std::time::Duration;
use tokio::fs::File;
use tokio::time::sleep;

fn build_remote_headers() -> AppResult<HeaderMap> {
    let mut headers = HeaderMap::new();

    if let Ok(token) = std::env::var("WMO_REMOTE_CACHE_TOKEN") {
        if !token.trim().is_empty() {
            let value = HeaderValue::from_str(&format!("Bearer {}", token.trim()))
                .map_err(|e| AppError::Cache(format!("Invalid WMO_REMOTE_CACHE_TOKEN: {}", e)))?;
            headers.insert(AUTHORIZATION, value);
        }
    }

    if let Ok(raw) = std::env::var("WMO_REMOTE_CACHE_HEADERS_JSON") {
        if !raw.trim().is_empty() {
            let value: serde_json::Value = serde_json::from_str(&raw)?;
            let obj = value.as_object().ok_or_else(|| {
                AppError::Cache("WMO_REMOTE_CACHE_HEADERS_JSON must be a JSON object".to_string())
            })?;

            for (k, v) in obj {
                let name = HeaderName::from_bytes(k.as_bytes()).map_err(|e| {
                    AppError::Cache(format!(
                        "Invalid header name in WMO_REMOTE_CACHE_HEADERS_JSON: {}",
                        e
                    ))
                })?;
                let value_str = v.as_str().ok_or_else(|| {
                    AppError::Cache(
                        "WMO_REMOTE_CACHE_HEADERS_JSON values must be strings".to_string(),
                    )
                })?;
                let value = HeaderValue::from_str(value_str).map_err(|e| {
                    AppError::Cache(format!(
                        "Invalid header value in WMO_REMOTE_CACHE_HEADERS_JSON: {}",
                        e
                    ))
                })?;
                headers.insert(name, value);
            }
        }
    }

    Ok(headers)
}

fn build_client() -> AppResult<Client> {
    let timeout_ms = std::env::var("WMO_REMOTE_CACHE_TIMEOUT_MS")
        .ok()
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(30_000);
    Ok(Client::builder()
        .timeout(Duration::from_millis(timeout_ms))
        .build()?)
}

fn retry_count() -> usize {
    std::env::var("WMO_REMOTE_CACHE_RETRY")
        .ok()
        .and_then(|s| s.parse::<usize>().ok())
        .unwrap_or(2)
}

fn expected_integrity_header_name() -> HeaderName {
    let header = std::env::var("WMO_REMOTE_CACHE_INTEGRITY_HEADER")
        .ok()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "x-wmo-cache-integrity".to_string());
    HeaderName::from_bytes(header.as_bytes())
        .unwrap_or(HeaderName::from_static("x-wmo-cache-integrity"))
}

pub async fn remote_cache_exists(hash: &str, remote_cache_url: &str) -> AppResult<bool> {
    let client = build_client()?;
    let headers = build_remote_headers()?;
    let url = format!("{}/{}", remote_cache_url, hash);

    let mut attempt = 0usize;
    loop {
        let response = client.head(&url).headers(headers.clone()).send().await;
        match response {
            Ok(resp) => return Ok(resp.status() == StatusCode::OK),
            Err(e) => {
                if attempt >= retry_count() {
                    return Err(e.into());
                }
                attempt += 1;
                sleep(Duration::from_millis(200 * attempt as u64)).await;
            }
        }
    }
}

pub async fn download_remote_cache(hash: &str, remote_cache_url: &str) -> AppResult<()> {
    let client = build_client()?;
    let headers = build_remote_headers()?;
    let url = format!("{}/{}", remote_cache_url, hash);

    let mut attempt = 0usize;
    loop {
        let response = client.get(&url).headers(headers.clone()).send().await;
        match response {
            Ok(resp) => {
                if resp.status() != StatusCode::OK {
                    return Err(AppError::Cache(format!(
                        "Failed to download cache: {}",
                        resp.status()
                    )));
                }

                let expected_integrity = resp
                    .headers()
                    .get(expected_integrity_header_name())
                    .and_then(|v| v.to_str().ok())
                    .map(|s| s.to_string());

                let cache_path = get_cache_path(hash);
                let path = Path::new(&cache_path);
                if let Some(parent) = path.parent() {
                    tokio::fs::create_dir_all(parent).await?;
                }

                let content = resp.bytes().await?;

                if let Some(expected) = expected_integrity {
                    let actual = blake3::hash(&content).to_hex().to_string();
                    if actual != expected {
                        return Err(AppError::Cache(format!(
                            "Remote cache integrity mismatch (expected {}, got {})",
                            expected, actual
                        )));
                    }
                }

                let mut file = File::create(&cache_path).await?;
                tokio::io::copy(&mut content.as_ref(), &mut file).await?;
                return Ok(());
            }
            Err(e) => {
                if attempt >= retry_count() {
                    return Err(e.into());
                }
                attempt += 1;
                sleep(Duration::from_millis(200 * attempt as u64)).await;
            }
        }
    }
}

pub async fn upload_remote_cache(hash: &str, remote_cache_url: &str) -> AppResult<()> {
    let cache_path = get_cache_path(hash);
    let path = Path::new(&cache_path);

    if !path.exists() {
        return Err(AppError::Cache("Cache file not found".to_string()));
    }

    let content = tokio::fs::read(&cache_path).await?;

    let client = build_client()?;
    let headers = build_remote_headers()?;
    let url = format!("{}/{}", remote_cache_url, hash);

    let mut attempt = 0usize;
    loop {
        let response = client
            .put(&url)
            .headers(headers.clone())
            .body(Body::from(content.clone()))
            .send()
            .await;

        match response {
            Ok(resp) => {
                if resp.status().is_success() {
                    return Ok(());
                }
                return Err(AppError::Cache(format!(
                    "Failed to upload cache: {}",
                    resp.status()
                )));
            }
            Err(e) => {
                if attempt >= retry_count() {
                    return Err(e.into());
                }
                attempt += 1;
                sleep(Duration::from_millis(200 * attempt as u64)).await;
            }
        }
    }
}
