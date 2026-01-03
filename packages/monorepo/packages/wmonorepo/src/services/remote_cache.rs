use crate::error::{AppError, AppResult};
use crate::services::cache::get_cache_path;
use reqwest::{Body, Client, StatusCode};
use std::path::Path;
use tokio::fs::File;
use tokio_util::codec::{BytesCodec, FramedRead};

pub async fn remote_cache_exists(hash: &str, remote_cache_url: &str) -> AppResult<bool> {
    let client = Client::new();
    let url = format!("{}/{}", remote_cache_url, hash);
    let response = client.head(&url).send().await?;
    Ok(response.status() == StatusCode::OK)
}

pub async fn download_remote_cache(hash: &str, remote_cache_url: &str) -> AppResult<()> {
    let client = Client::new();
    let url = format!("{}/{}", remote_cache_url, hash);
    let response = client.get(&url).send().await?;

    if response.status() == StatusCode::OK {
        let cache_path = get_cache_path(hash);
        let path = Path::new(&cache_path);
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        let mut file = File::create(&cache_path).await?;
        let content = response.bytes().await?;
        tokio::io::copy(&mut content.as_ref(), &mut file).await?;
        Ok(())
    } else {
        Err(AppError::Cache(format!("Failed to download cache: {}", response.status())))
    }
}

pub async fn upload_remote_cache(hash: &str, remote_cache_url: &str) -> AppResult<()> {
    let cache_path = get_cache_path(hash);
    let path = Path::new(&cache_path);

    if !path.exists() {
        return Err(AppError::Cache("Cache file not found".to_string()));
    }

    let file = File::open(&cache_path).await?;
    let stream = FramedRead::new(file, BytesCodec::new());
    let body = Body::wrap_stream(stream);

    let client = Client::new();
    let url = format!("{}/{}", remote_cache_url, hash);
    let response = client.put(&url).body(body).send().await?;

    if response.status().is_success() {
        Ok(())
    } else {
        Err(AppError::Cache(format!("Failed to upload cache: {}", response.status())))
    }
}
