use crate::components::abs_path::AbsPath;
use crate::error::{FsError, FsResult};
use crate::types::{FileKind, FileNode};
use camino::{Utf8Path, Utf8PathBuf};
use tokio::fs;

pub async fn create_dir_all(path: impl AsRef<Utf8Path>) -> FsResult<()> {
    let path = path.as_ref();
    fs::create_dir_all(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

pub async fn remove_file(path: impl AsRef<Utf8Path>) -> FsResult<()> {
    let path = path.as_ref();
    fs::remove_file(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

pub async fn remove_dir_all(path: impl AsRef<Utf8Path>) -> FsResult<()> {
    let path = path.as_ref();
    fs::remove_dir_all(path).await.map_err(|e| FsError::Io {
        path: path.to_path_buf(),
        source: e,
    })
}

use futures_util::future::BoxFuture;
use futures_util::FutureExt;

fn list_dir_inner(
    root: Utf8PathBuf,
    max_depth: usize,
    depth: usize,
) -> BoxFuture<'static, FsResult<Vec<FileNode>>> {
    async move {
        if depth > max_depth {
            return Ok(Vec::new());
        }

        let mut out = Vec::new();
        let mut entries = fs::read_dir(&root).await.map_err(|e| FsError::Io {
            path: root.to_path_buf(),
            source: e,
        })?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| FsError::Io {
            path: root.to_path_buf(),
            source: e,
        })? {
            let path = Utf8PathBuf::from_path_buf(entry.path()).map_err(|p| {
                FsError::Other(std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    format!("Invalid UTF-8 path: {:?}", p.into_os_string()),
                ))
            })?;
            let file_name = entry.file_name().to_string_lossy().to_string();

            if file_name == ".git" {
                continue;
            }

            let metadata = entry.metadata().await.map_err(|e| FsError::Io {
                path: path.clone(),
                source: e,
            })?;

            if metadata.is_dir() {
                let children = list_dir_inner(path.clone(), max_depth, depth + 1).await?;
                out.push(FileNode {
                    path: AbsPath::from(path),
                    name: file_name,
                    kind: FileKind::Dir,
                    size_bytes: None,
                    line_count: None,
                    children: Some(children),
                });
            } else {
                out.push(FileNode {
                    path: AbsPath::from(path),
                    name: file_name,
                    kind: FileKind::File,
                    size_bytes: Some(metadata.len()),
                    line_count: None,
                    children: None,
                });
            }
        }

        out.sort_by(|a, b| {
            let a_dir = matches!(a.kind, FileKind::Dir);
            let b_dir = matches!(b.kind, FileKind::Dir);

            match (a_dir, b_dir) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });

        Ok(out)
    }
    .boxed()
}

pub async fn list_files(root: impl AsRef<Utf8Path>, max_depth: usize) -> FsResult<Vec<FileNode>> {
    list_dir_inner(root.as_ref().to_path_buf(), max_depth, 0).await
}
