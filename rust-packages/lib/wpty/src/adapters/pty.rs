//! PTY Adapter - wraps portable-pty library
//!
//! Provides a clean interface for PTY operations and allows for testing

use crate::error::{AppError, Result};
use portable_pty::{CommandBuilder, MasterPty, NativePtySystem, PtyPair, PtySize, PtySystem};
use std::io::{Read, Write};

/// Adapter for PTY operations
pub struct PtyAdapter;

impl PtyAdapter {
    /// Open a new PTY
    pub fn open_pty(rows: u16, cols: u16) -> Result<PtyPair> {
        let pty_system = NativePtySystem::default();
        pty_system
            .openpty(PtySize {
                rows,
                cols,
                ..Default::default()
            })
            .map_err(|e| AppError::OpenPty(std::io::Error::other(e.to_string())))
    }

    /// Create a command builder
    pub fn command_builder(command: &str) -> CommandBuilder {
        CommandBuilder::new(command)
    }
}

/// Trait for PTY operations (for mocking in tests)
pub trait PtyPort: Send + Sync {
    fn try_clone_reader(&self) -> anyhow::Result<Box<dyn Read + Send>>;
    fn take_writer(&self) -> anyhow::Result<Box<dyn Write + Send>>;
    fn resize(&self, rows: u16, cols: u16) -> anyhow::Result<()>;
    fn get_size(&self) -> anyhow::Result<PtySize>;
}
