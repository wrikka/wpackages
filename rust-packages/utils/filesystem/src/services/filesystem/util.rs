use crate::error::{FsError, FsResult};
use super::read::read_file_stream;
use camino::{Utf8Path, Utf8PathBuf};
use futures_util::StreamExt;
use glob::glob;
use ring::digest::{Context, SHA256};
use std::fs::Permissions;
use tempfile::{tempdir, NamedTempFile};
use tokio::fs;

pub async fn metadata(path: impl AsRef<Utf8Path>) -> FsResult<std::fs::Metadata> {
    let path = path.as_ref();
    fs::metadata(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

pub async fn glob_search(pattern: &str) -> FsResult<Vec<Utf8PathBuf>> {
    let pattern_str = pattern.to_string();
    let paths = tokio::task::spawn_blocking(move || match glob(&pattern_str) {
        Ok(entries) => {
            let paths: Vec<Utf8PathBuf> = entries
                .flatten()
                .filter_map(|path| Utf8PathBuf::from_path_buf(path).ok())
                .collect();
            Ok(paths)
        }
        Err(e) => Err(e.to_string()),
    })
    .await
    .map_err(|e| FsError::Other(std::io::Error::other(e)))?
    .map_err(|e| FsError::Other(std::io::Error::new(std::io::ErrorKind::InvalidInput, e)))?;

    Ok(paths)
}

pub async fn calculate_hash(path: impl AsRef<Utf8Path>) -> FsResult<String> {
    let path_ref = path.as_ref();
    let mut stream = read_file_stream(path_ref).await?;
    let mut context = Context::new(&SHA256);

    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|e| FsError::Io {
            path: path_ref.to_path_buf(),
            source: e,
        })?;
        context.update(&bytes);
    }

    let digest = context.finish();
    Ok(hex::encode(digest.as_ref()))
}

pub async fn free_space(path: impl AsRef<Utf8Path>) -> FsResult<u64> {
    let path = path.as_ref().to_path_buf();
    let path_for_block = path.clone();
    tokio::task::spawn_blocking(move || fs2::free_space(&path_for_block))
        .await
        .map_err(|e| FsError::Other(std::io::Error::other(e)))?
        .map_err(|e| FsError::Io {
            path: path.clone(),
            source: e,
        })
}

pub async fn total_space(path: impl AsRef<Utf8Path>) -> FsResult<u64> {
    let path = path.as_ref().to_path_buf();
    let path_for_block = path.clone();
    tokio::task::spawn_blocking(move || fs2::total_space(&path_for_block))
        .await
        .map_err(|e| FsError::Other(std::io::Error::other(e)))?
        .map_err(|e| FsError::Io {
            path: path.clone(),
            source: e,
        })
}

pub async fn temp_file() -> FsResult<Utf8PathBuf> {
    tokio::task::spawn_blocking(move || -> FsResult<Utf8PathBuf> {
        let temp_file = NamedTempFile::new().map_err(FsError::from)?;
        let path = temp_file.path().to_path_buf();
        let utf8_path = Utf8PathBuf::from_path_buf(path).map_err(|p| {
            FsError::Other(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("Invalid UTF-8 path: {:?}", p.into_os_string()),
            ))
        })?;
        // The file is closed when `temp_file` is dropped, but the path remains.
        Ok(utf8_path)
    })
    .await
    .map_err(|e| FsError::Other(std::io::Error::other(e)))?
}

pub async fn temp_dir() -> FsResult<Utf8PathBuf> {
    tokio::task::spawn_blocking(move || -> FsResult<Utf8PathBuf> {
        let temp_dir = tempdir().map_err(FsError::from)?;
        let path = temp_dir.path().to_path_buf();
        let utf8_path = Utf8PathBuf::from_path_buf(path).map_err(|p| {
            FsError::Other(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("Invalid UTF-8 path: {:?}", p.into_os_string()),
            ))
        })?;
        // The directory is deleted when `temp_dir` is dropped, but the path remains.
        Ok(utf8_path)
    })
    .await
    .map_err(|e| FsError::Other(std::io::Error::other(e)))?
}

pub async fn permissions(path: impl AsRef<Utf8Path>) -> FsResult<Permissions> {
    let meta = metadata(path).await?;
    Ok(meta.permissions())
}

pub async fn set_permissions(path: impl AsRef<Utf8Path>, permissions: Permissions) -> FsResult<()> {
    let path = path.as_ref();
    fs::set_permissions(path, permissions)
        .await
        .map_err(|e| FsError::Io {
            path: path.to_path_buf(),
            source: e,
        })
}
