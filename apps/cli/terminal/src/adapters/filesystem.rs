//! Filesystem Adapter
//!
//! Wrapper for filesystem operations

use std::fs;
use std::path::Path;

pub struct FilesystemAdapter;

impl FilesystemAdapter {
    pub fn read_to_string<P: AsRef<Path>>(path: P) -> std::io::Result<String> {
        fs::read_to_string(path)
    }

    pub fn write<P: AsRef<Path>, C: AsRef<[u8]>>(path: P, contents: C) -> std::io::Result<()> {
        fs::write(path, contents)
    }

    pub fn exists<P: AsRef<Path>>(path: P) -> bool {
        path.as_ref().exists()
    }

    pub fn create_dir_all<P: AsRef<Path>>(path: P) -> std::io::Result<()> {
        fs::create_dir_all(path)
    }

    pub fn remove_file<P: AsRef<Path>>(path: P) -> std::io::Result<()> {
        fs::remove_file(path)
    }
}
