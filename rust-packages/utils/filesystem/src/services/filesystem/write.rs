use crate::error::{FsError, FsResult};
use camino::Utf8Path;
use futures_util::stream::Stream;
use tokio::fs;
use tokio::io::AsyncWriteExt;

pub async fn write_text_file(
    path: impl AsRef<Utf8Path>,
    content: impl AsRef<[u8]>,
) -> FsResult<()> {
    let path = path.as_ref();
    fs::write(path, content).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

pub async fn write_file_stream(
    path: impl AsRef<Utf8Path>,
    mut stream: impl Stream<Item = std::io::Result<bytes::Bytes>> + Unpin,
) -> FsResult<()> {
    let path = path.as_ref();
    let mut file = fs::File::create(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })?;

    while let Some(chunk) = futures_util::StreamExt::next(&mut stream).await {
        file.write_all(&chunk.map_err(FsError::from)?)
            .await
            .map_err(|e| FsError::Io {
                path: path.to_path_buf(),
                source: e,
            })?;
    }

    Ok(())
}

pub async fn write_binary_file(
    path: impl AsRef<Utf8Path>,
    content: impl AsRef<[u8]>,
) -> FsResult<()> {
    write_text_file(path, content).await
}

pub async fn create_file(path: impl AsRef<Utf8Path>) -> FsResult<()> {
    let path = path.as_ref();
    if let Some(parent) = path.parent() {
        super::dir::create_dir_all(parent).await?;
    }
    fs::File::create(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })?;
    Ok(())
}
