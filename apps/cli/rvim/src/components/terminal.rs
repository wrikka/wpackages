use anyhow::Result;
use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use ratatui::{
    prelude::*,
    widgets::{Block, Borders, Paragraph},
};
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tracing;

pub struct TerminalComponent {
    pty_writer: Box<dyn Write + Send>,
    buffer: Arc<Mutex<Vec<u8>>>,
}

impl TerminalComponent {
    pub fn new() -> Result<Self> {
        let pty_system = NativePtySystem::default();
        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        let cmd = CommandBuilder::new(if cfg!(windows) { "cmd.exe" } else { "bash" });
        let mut child = pair.slave.spawn_command(cmd)?;

        let mut pty_reader = pair.master.try_clone_reader()?;
        let pty_writer = pair.master.take_writer()?;

        let buffer = Arc::new(Mutex::new(Vec::new()));
        let buffer_clone = buffer.clone();

        thread::spawn(move || {
            let mut buf = [0u8; 8192];
            loop {
                match pty_reader.read(&mut buf) {
                    Ok(0) | Err(_) => break,
                    Ok(len) => {
                        if let Ok(mut term_buf) = buffer_clone.lock() {
                            term_buf.extend_from_slice(&buf[..len]);
                        } else {
                            tracing::error!(
                                "Terminal buffer mutex poisoned, stopping pty reader thread."
                            );
                            break;
                        }
                    }
                }
            }
        });

        thread::spawn(move || {
            let _ = child.wait();
        });

        Ok(Self {
            pty_writer: Box::new(pty_writer),
            buffer,
        })
    }

    pub fn handle_input(&mut self, input: &[u8]) -> Result<()> {
        self.pty_writer.write_all(input)?;
        Ok(())
    }

    pub fn render(&self, frame: &mut Frame, area: Rect) {
        let block = Block::default().borders(Borders::ALL).title("Terminal");
        let text = if let Ok(buffer) = self.buffer.lock() {
            String::from_utf8_lossy(&buffer).to_string()
        } else {
            "Error: Terminal mutex poisoned".to_string()
        };

        let terminal_output = Paragraph::new(text).block(block);
        frame.render_widget(terminal_output, area);
    }
}
