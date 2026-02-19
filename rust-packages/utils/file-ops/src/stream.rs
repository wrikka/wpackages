//! Provides a low-level function for streaming data with progress reporting.

use crate::constants::DEFAULT_BUFFER_SIZE;
use crate::progress::{Progress, ProgressCallback};
use std::io::{Read, Result, Write};

/// Streams data from a reader to a writer, reporting progress along the way.
///
/// This is a building block for other functions like `copy`.
///
/// # Arguments
///
/// * `reader` - A mutable reference to a type implementing `Read`.
/// * `writer` - A mutable reference to a type implementing `Write`.
/// * `total_bytes` - The total number of bytes to be streamed, used for progress calculation.
/// * `progress_callback` - An optional callback for progress updates.
///
/// # Example
///
/// ```no_run
/// use file_ops::stream_data;
/// use std::io::Cursor;
///
/// let mut source = Cursor::new(vec![0; 1024]);
/// let mut dest = Cursor::new(Vec::new());
///
/// stream_data(&mut source, &mut dest, 1024, &None).unwrap();
/// ```
pub fn stream_data<'a>(
    reader: &mut dyn Read,
    writer: &mut dyn Write,
    total_bytes: u64,
    progress_callback: &Option<ProgressCallback<'a>>,
) -> Result<u64> {
    let mut transferred_bytes = 0;
    let mut buffer = vec![0; DEFAULT_BUFFER_SIZE];

    loop {
        let bytes_read = reader.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }

        writer.write_all(&buffer[..bytes_read])?;
        transferred_bytes += bytes_read as u64;

        if let Some(callback) = progress_callback {
            callback(Progress {
                total_bytes,
                transferred_bytes,
            });
        }
    }

    Ok(transferred_bytes)
}
