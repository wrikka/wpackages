//! Provides a file tailing utility to monitor a file for new lines.
//!
//! This module implements a `Tailer` that acts as an iterator, yielding new lines
//! as they are written to a file, similar to the `tail -f` command.

use crate::error::{Error, Result};
use camino::Utf8Path;
use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::sync::mpsc::{channel, Receiver};

/// A file tailer that yields new lines as they are added to a file.
///
/// The `Tailer` implements the `Iterator` trait, so you can use it in `for` loops.
///
/// # Example
///
/// ```no_run
/// use file_ops::Tailer;
/// use camino::Utf8Path;
/// use std::fs::File;
/// use std::io::Write;
/// use std::thread;
/// use std::time::Duration;
///
/// let path = Utf8Path::new("my_log.txt");
/// // File::create(path).unwrap(); // Ensure the file exists
/// let tailer = Tailer::new(path).unwrap();
///
/// // In another thread, append to the file.
/// let handle = thread::spawn(move || {
///     let mut file = std::fs::OpenOptions::new().append(true).open(path).unwrap();
///     thread::sleep(Duration::from_millis(100));
///     writeln!(file, "new line").unwrap();
/// });
///
/// for line in tailer {
///     println!("{}", line.unwrap());
///     break; // Exit after the first line for this example.
/// }
///
/// handle.join().unwrap();
/// ```
pub struct Tailer {
    reader: BufReader<File>,
    _watcher: RecommendedWatcher,
    rx: Receiver<notify::Result<notify::Event>>,
}

impl Tailer {
    /// Creates a new `Tailer` for the given file path.
    ///
    /// The tailer will start reading from the end of the file.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the file to tail.
    pub fn new(path: &Utf8Path) -> Result<Self> {
        let file = File::open(path)?;
        let mut reader = BufReader::new(file);
        reader.seek(SeekFrom::End(0))?;

        let (tx, rx) = channel();
        let mut watcher = notify::recommended_watcher(tx)?;
        watcher.watch(path.as_std_path(), RecursiveMode::NonRecursive)?;

        Ok(Self {
            reader,
            _watcher: watcher,
            rx,
        })
    }
}

impl Iterator for Tailer {
    type Item = Result<String>;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
            let mut line = String::new();
            match self.reader.read_line(&mut line) {
                Ok(0) => {
                    // End of file, wait for a change
                    if self.rx.recv().is_err() {
                        // Channel closed, stop iterating
                        return None;
                    }
                }
                Ok(_) => {
                    // Got a line, return it
                    if line.ends_with('\n') {
                        line.pop();
                        if line.ends_with('\r') {
                            line.pop();
                        }
                    }
                    return Some(Ok(line));
                }
                Err(e) => return Some(Err(e.into())),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::OpenOptions;
    use std::io::Write;
    use std::thread;
    use std::time::Duration;
    use tempfile::tempdir;

    #[test]
    fn test_tailer() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        File::create(&file_path)?;

        let mut tailer = Tailer::new(&file_path)?;

        let writer_thread = thread::spawn(move || {
            let mut file = OpenOptions::new().append(true).open(file_path).unwrap();
            thread::sleep(Duration::from_millis(100));
            writeln!(file, "line 1").unwrap();
            thread::sleep(Duration::from_millis(100));
            writeln!(file, "line 2").unwrap();
        });

        assert_eq!(tailer.next().unwrap()?, "line 1");
        assert_eq!(tailer.next().unwrap()?, "line 2");

        writer_thread.join().unwrap();

        Ok(())
    }
}