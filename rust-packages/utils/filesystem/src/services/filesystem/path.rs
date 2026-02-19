use crate::error::{FsError, FsResult};
use camino::Utf8Path;
use tokio::fs;

pub async fn rename(from: impl AsRef<Utf8Path>, to: impl AsRef<Utf8Path>) -> FsResult<()> {
    let from = from.as_ref();
    fs::rename(from, to.as_ref())
        .await
        .map_err(|e| FsError::Io {
            path: from.to_path_buf(),
            source: e,
        })
}

pub async fn copy_file(from: impl AsRef<Utf8Path>, to: impl AsRef<Utf8Path>) -> FsResult<u64> {
    let from = from.as_ref();
    fs::copy(from, to.as_ref()).await.map_err(|e| FsError::Io {
        path: from.to_path_buf(),
        source: e,
    })
}

pub async fn path_exists(path: impl AsRef<Utf8Path>) -> bool {
    fs::try_exists(path.as_ref()).await.unwrap_or(false)
}

pub async fn symlink(original: impl AsRef<Utf8Path>, link: impl AsRef<Utf8Path>) -> FsResult<()> {
    let original = original.as_ref();
    let link = link.as_ref();

    #[cfg(windows)]
    {
        let meta = tokio::fs::metadata(original)
            .await
            .map_err(|e| FsError::Io {
                path: original.to_path_buf(),
                source: e,
            })?;

        let res = if meta.is_dir() {
            tokio::fs::symlink_dir(original, link).await
        } else {
            tokio::fs::symlink_file(original, link).await
        };
        res.map_err(|e| FsError::Io {
            path: original.to_path_buf(),
            source: e,
        })
    }

    #[cfg(not(windows))]
    {
        tokio::fs::symlink(original, link)
            .await
            .map_err(|e| FsError::Io {
                path: original.to_path_buf(),
                source: e,
            })
    }
}

pub async fn hard_link(original: impl AsRef<Utf8Path>, link: impl AsRef<Utf8Path>) -> FsResult<()> {
    let original = original.as_ref();
    tokio::fs::hard_link(original, link.as_ref())
        .await
        .map_err(|e| FsError::Io {
            path: original.to_path_buf(),
            source: e,
        })
}
