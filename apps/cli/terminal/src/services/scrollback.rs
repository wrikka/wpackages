use anyhow::Result;
use dashmap::DashMap;
use parking_lot::RwLock;
use std::collections::VecDeque;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct TerminalLine {
    pub id: Uuid,
    pub content: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub attributes: LineAttributes,
}

#[derive(Debug, Clone, Default)]
pub struct LineAttributes {
    pub foreground: Option<(u8, u8, u8)>,
    pub background: Option<(u8, u8, u8)>,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
}

#[derive(Debug, Clone)]
pub struct ScrollbackBuffer {
    pub max_lines: usize,
    pub max_memory_bytes: usize,
    lines: VecDeque<TerminalLine>,
    total_memory: usize,
    compressed_lines: Arc<DashMap<Uuid, Vec<u8>>>,
}

impl ScrollbackBuffer {
    pub fn new(max_lines: usize, max_memory_bytes: usize) -> Self {
        Self {
            max_lines,
            max_memory_bytes,
            lines: VecDeque::with_capacity(max_lines),
            total_memory: 0,
            compressed_lines: Arc::new(DashMap::new()),
        }
    }

    pub fn push(&mut self, line: TerminalLine) -> Result<()> {
        let line_size = self.estimate_line_size(&line);

        if self.total_memory + line_size > self.max_memory_bytes {
            self.compress_oldest_lines()?;
        }

        if self.lines.len() >= self.max_lines {
            if let Some(removed) = self.lines.pop_front() {
                self.total_memory -= self.estimate_line_size(&removed);
            }
        }

        self.total_memory += line_size;
        self.lines.push_back(line);

        Ok(())
    }

    pub fn get(&self, index: usize) -> Option<&TerminalLine> {
        self.lines.get(index)
    }

    pub fn get_range(&self, start: usize, end: usize) -> Vec<TerminalLine> {
        self.lines
            .iter()
            .skip(start)
            .take(end - start)
            .cloned()
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<(usize, TerminalLine)> {
        self.lines
            .iter()
            .enumerate()
            .filter(|(_, line)| line.content.contains(query))
            .map(|(i, line)| (i, line.clone()))
            .collect()
    }

    pub fn len(&self) -> usize {
        self.lines.len()
    }

    pub fn is_empty(&self) -> bool {
        self.lines.is_empty()
    }

    pub fn clear(&mut self) {
        self.lines.clear();
        self.total_memory = 0;
        self.compressed_lines.clear();
    }

    fn estimate_line_size(&self, line: &TerminalLine) -> usize {
        line.content.len() + std::mem::size_of::<TerminalLine>()
    }

    fn compress_oldest_lines(&mut self) -> Result<()> {
        const COMPRESS_THRESHOLD: f64 = 0.8;
        const COMPRESS_BATCH: usize = 100;

        if self.total_memory as f64 < self.max_memory_bytes as f64 * COMPRESS_THRESHOLD {
            return Ok(());
        }

        let mut compressed_count = 0;
        let mut freed_memory = 0;

        for line in self.lines.drain(..COMPRESS_BATCH.min(self.lines.len())) {
            let line_size = self.estimate_line_size(&line);
            let compressed = brotli::compress_to_vec(line.content.as_bytes(), 6)?;

            self.compressed_lines.insert(line.id, compressed);
            freed_memory += line_size;
            compressed_count += 1;
        }

        self.total_memory -= freed_memory;
        tracing::debug!(
            "Compressed {} lines, freed {} bytes",
            compressed_count,
            freed_memory
        );

        Ok(())
    }

    pub fn decompress_line(&self, id: Uuid) -> Option<String> {
        if let Some(compressed) = self.compressed_lines.get(&id) {
            let decompressed = brotli::decompress_to_vec(compressed).ok()?;
            String::from_utf8(decompressed).ok()
        } else {
            None
        }
    }

    pub fn get_memory_usage(&self) -> usize {
        self.total_memory
    }

    pub fn get_compressed_count(&self) -> usize {
        self.compressed_lines.len()
    }
}

#[derive(Debug, Clone)]
pub struct TerminalBuffer {
    pub active_lines: Vec<TerminalLine>,
    pub scrollback: ScrollbackBuffer,
    pub cursor_position: (usize, usize),
}

impl TerminalBuffer {
    pub fn new(max_scrollback: usize, max_memory: usize) -> Self {
        Self {
            active_lines: Vec::new(),
            scrollback: ScrollbackBuffer::new(max_scrollback, max_memory),
            cursor_position: (0, 0),
        }
    }

    pub fn add_line(&mut self, line: TerminalLine) -> Result<()> {
        self.scrollback.push(line.clone())?;
        self.active_lines.push(line);
        self.cursor_position = (self.active_lines.len() - 1, 0);
        Ok(())
    }

    pub fn get_visible_lines(&self, viewport_height: usize) -> Vec<TerminalLine> {
        let start = self.cursor_position.0.saturating_sub(viewport_height / 2);
        let end = (start + viewport_height).min(self.scrollback.len());
        self.scrollback.get_range(start, end)
    }

    pub fn scroll_up(&mut self, lines: usize) {
        self.cursor_position.0 = self.cursor_position.0.saturating_sub(lines);
    }

    pub fn scroll_down(&mut self, lines: usize) {
        self.cursor_position.0 = (self.cursor_position.0 + lines).min(self.scrollback.len() - 1);
    }

    pub fn clear(&mut self) {
        self.active_lines.clear();
        self.scrollback.clear();
        self.cursor_position = (0, 0);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scrollback_buffer() {
        let mut buffer = ScrollbackBuffer::new(1000, 10_000_000);

        for i in 0..100 {
            let line = TerminalLine {
                id: Uuid::new_v4(),
                content: format!("Line {}", i),
                timestamp: chrono::Utc::now(),
                attributes: LineAttributes::default(),
            };
            buffer.push(line).unwrap();
        }

        assert_eq!(buffer.len(), 100);
        assert!(!buffer.is_empty());
    }

    #[test]
    fn test_search() {
        let mut buffer = ScrollbackBuffer::new(1000, 10_000_000);

        for i in 0..10 {
            let line = TerminalLine {
                id: Uuid::new_v4(),
                content: format!("Test Line {}", i),
                timestamp: chrono::Utc::now(),
                attributes: LineAttributes::default(),
            };
            buffer.push(line).unwrap();
        }

        let results = buffer.search("Test");
        assert_eq!(results.len(), 10);
    }
}
