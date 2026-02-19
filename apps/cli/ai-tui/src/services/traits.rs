//! Service traits for abstracting I/O operations
//!
//! This module defines traits that abstract external interactions,
//! enabling testability and following the dependency injection pattern.

use crate::error::Result;
use crate::types::{
    FileEntry, FileMetadata, KeyCode, KeyEvent, KeyModifiers, MouseButton, MouseEvent,
    TerminalEvent,
};
use async_trait::async_trait;
use std::path::PathBuf;

/// Trait for filesystem operations
#[async_trait]
pub trait FilesystemService: Send + Sync {
    /// Read directory entries
    async fn read_dir(&self, path: &PathBuf) -> Result<Vec<FileEntry>>;

    /// Check if path is a directory
    async fn is_dir(&self, path: &PathBuf) -> bool;

    /// Get file metadata
    async fn metadata(&self, path: &PathBuf) -> Result<Option<FileMetadata>>;

    /// Get parent directory
    fn parent(&self, path: &PathBuf) -> Option<PathBuf>;
}

/// Real filesystem implementation
#[derive(Debug, Clone, Default)]
pub struct RealFilesystem;

impl RealFilesystem {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl FilesystemService for RealFilesystem {
    async fn read_dir(&self, path: &PathBuf) -> Result<Vec<FileEntry>> {
        let mut entries = Vec::new();

        let read_result = std::fs::read_dir(path)?;

        for entry in read_result.flatten() {
            let path = entry.path();
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let is_directory = path.is_dir();
            let metadata = entry
                .metadata()
                .ok()
                .map(|m| FileMetadata { size: m.len() });

            entries.push(FileEntry {
                name,
                path,
                is_directory,
                metadata,
            });
        }

        Ok(entries)
    }

    async fn is_dir(&self, path: &PathBuf) -> bool {
        path.is_dir()
    }

    async fn metadata(&self, path: &PathBuf) -> Result<Option<FileMetadata>> {
        Ok(std::fs::metadata(path)
            .ok()
            .map(|m| FileMetadata { size: m.len() }))
    }

    fn parent(&self, path: &PathBuf) -> Option<PathBuf> {
        path.parent().map(|p| p.to_path_buf())
    }
}

/// Trait for terminal event handling
#[async_trait]
pub trait EventService: Send + Sync {
    /// Read the next terminal event
    async fn read_event(&self) -> Result<TerminalEvent>;

    /// Check if an event is available (non-blocking)
    async fn poll_event(&self, timeout: std::time::Duration) -> Result<bool>;
}

/// Real terminal event implementation
#[derive(Debug, Clone, Default)]
pub struct RealEventService;

impl RealEventService {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl EventService for RealEventService {
    async fn read_event(&self) -> Result<TerminalEvent> {
        use crossterm::event::{self, Event, KeyCode as CKeyCode, KeyModifiers as CKeyModifiers};

        match event::read()? {
            Event::Key(key) => {
                let code = match key.code {
                    CKeyCode::Char(c) => KeyCode::Char(c),
                    CKeyCode::Enter => KeyCode::Enter,
                    CKeyCode::Esc => KeyCode::Esc,
                    CKeyCode::Backspace => KeyCode::Backspace,
                    CKeyCode::Tab => KeyCode::Tab,
                    CKeyCode::Up => KeyCode::Up,
                    CKeyCode::Down => KeyCode::Down,
                    CKeyCode::Left => KeyCode::Left,
                    CKeyCode::Right => KeyCode::Right,
                    CKeyCode::Home => KeyCode::Home,
                    CKeyCode::End => KeyCode::End,
                    CKeyCode::PageUp => KeyCode::PageUp,
                    CKeyCode::PageDown => KeyCode::PageDown,
                    CKeyCode::Delete => KeyCode::Delete,
                    CKeyCode::Insert => KeyCode::Insert,
                    CKeyCode::F(n) => KeyCode::F(n),
                    _ => KeyCode::Char('?'),
                };

                let modifiers = KeyModifiers {
                    ctrl: key.modifiers.contains(CKeyModifiers::CONTROL),
                    alt: key.modifiers.contains(CKeyModifiers::ALT),
                    shift: key.modifiers.contains(CKeyModifiers::SHIFT),
                };

                Ok(TerminalEvent::Key(KeyEvent { code, modifiers }))
            }
            Event::Resize(w, h) => Ok(TerminalEvent::Resize(w, h)),
            Event::Mouse(mouse) => {
                use crossterm::event::{MouseButton as CMouseButton, MouseEventKind};

                let button = match mouse.kind {
                    MouseEventKind::Down(btn) => match btn {
                        CMouseButton::Left => Some(MouseButton::Left),
                        CMouseButton::Right => Some(MouseButton::Right),
                        CMouseButton::Middle => Some(MouseButton::Middle),
                    },
                    _ => None,
                };

                let event = match button {
                    Some(btn) => MouseEvent::Press(btn, mouse.column, mouse.row),
                    None => MouseEvent::Release(mouse.column, mouse.row),
                };

                Ok(TerminalEvent::Mouse(event))
            }
            _ => Ok(TerminalEvent::Key(KeyEvent {
                code: KeyCode::Char('?'),
                modifiers: KeyModifiers::default(),
            })),
        }
    }

    async fn poll_event(&self, timeout: std::time::Duration) -> Result<bool> {
        Ok(crossterm::event::poll(timeout)?)
    }
}
