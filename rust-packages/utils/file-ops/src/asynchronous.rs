use crate::error::{Error, Result};
use crate::progress::{Progress, ProgressCallback};
use camino::Utf8Path;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

const BUFFER_SIZE: usize = 8192; // 8 KB

/// Asynchronously and atomically writes data to a file.
///
/// This function ensures that the file is never left in a partially written state.
/// It first writes to a temporary file and then renames it to the final destination.
///
/// # Arguments
///
/// * `path` - The destination file path.
/// * `data` - The data to write.
///
/// # Example
///
/// ```no_run
/// use file_ops::async_ops::atomic_write;
/// use camino::Utf8Path;
///
/// #[tokio::main]
/// async fn main() {
///     let path = Utf8Path::new("atomic.txt");
///     atomic_write(path, b"atomic write").await.unwrap();
/// }
/// ```
pub async fn atomic_write(path: &Utf8Path, data: &[u8]) -> Result<()> {
    let temp_path = path.with_extension("tmp");
    let mut temp_file = File::create(&temp_path).await.map_err(|e| Error::Io { path: temp_path.to_path_buf(), source: e })?;
    temp_file.write_all(data).await.map_err(|e| Error::Io { path: temp_path.to_path_buf(), source: e })?;
    temp_file.sync_all().await.map_err(|e| Error::Io { path: temp_path.to_path_buf(), source: e })?;
    tokio::fs::rename(&temp_path, path).await.map_err(|e| Error::Io { path: temp_path.to_path_buf(), source: e })?;
    Ok(())
}

/// Asynchronously copies a file from `from` to `to` with progress reporting.
///
/// # Arguments
///
/// * `from` - The source file path.
/// * `to` - The destination file path.
/// * `progress_callback` - An optional callback for progress updates.
///
/// # Example
///
/// ```no_run
/// use file_ops::async_ops::copy;
/// use file_ops::progress::Progress;
/// use camino::Utf8Path;
///
/// #[tokio::main]
/// async fn main() {
///     let from = Utf8Path::new("source.txt");
///     let to = Utf8Path::new("dest.txt");
///     let progress_callback = Some(Box::new(|progress: Progress| {
///         println!("Copied {}/{} bytes", progress.transferred_bytes, progress.total_bytes);
///     }));
///     copy(from, to, &progress_callback).await.unwrap();
/// }
/// ```
pub async fn copy<'a>(
    from: &Utf8Path,
    to: &Utf8Path,
    progress_callback: &Option<ProgressCallback<'a>>,
) -> Result<()> {
    let mut from_file = File::open(from).await.map_err(|e| Error::Io { path: from.to_path_buf(), source: e })?;
    let mut to_file = File::create(to).await.map_err(|e| Error::Io { path: to.to_path_buf(), source: e })?;
    let total_bytes = from_file.metadata().await.map(|m| m.len()).unwrap_or(0);
    let mut transferred_bytes = 0;
    let mut buffer = vec![0; BUFFER_SIZE];

    loop {
        let bytes_read = from_file.read(&mut buffer).await.map_err(|e| Error::Io { path: from.to_path_buf(), source: e })?;
        if bytes_read == 0 {
            break;
        }

        to_file.write_all(&buffer[..bytes_read]).await.map_err(|e| Error::Io { path: to.to_path_buf(), source: e })?;
        transferred_bytes += bytes_read as u64;

        if let Some(callback) = progress_callback {
            callback(Progress {
                total_bytes,
                transferred_bytes,
            });
        }
    }

    Ok(())
}

// Note: Other functions can be wrapped in `tokio::task::spawn_blocking` for a quick async version,
// but a true async implementation requires async-native libraries for each feature (e.g., async compression).
// This implementation provides a starting point for the most common I/O-bound operations.
