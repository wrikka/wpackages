use crate::error::{FsError, FsResult};
use camino::{Utf8Path, Utf8PathBuf};
use futures_util::{stream::Stream, StreamExt};
use tokio::fs;
use tokio_util::codec::{BytesCodec, FramedRead};

pub async fn read_text_file(path: impl AsRef<Utf8Path>) -> FsResult<String> {
    let path = path.as_ref();
    fs::read_to_string(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

pub async fn read_file_stream(
    path: impl AsRef<Utf8Path>,
) -> FsResult<impl Stream<Item = std::io::Result<bytes::Bytes>>> {
    let path = path.as_ref();
    let file = fs::File::open(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })?;
    Ok(FramedRead::new(file, BytesCodec::new()).map(|res| res.map(|bytes_mut| bytes_mut.freeze())))
}

pub async fn read_binary_file(path: impl AsRef<Utf8Path>) -> FsResult<Vec<u8>> {
    let path = path.as_ref();
    fs::read(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

pub async fn read_link(path: impl AsRef<Utf8Path>) -> FsResult<Utf8PathBuf> {
    let path = path.as_ref();
    let link_path = tokio::fs::read_link(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })?;
    Utf8PathBuf::from_path_buf(link_path).map_err(|p| {
        FsError::InvalidUtf8 {
            path: p,
        }
    })
}
