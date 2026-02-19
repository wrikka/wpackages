use crate::error::{DebugError, DebugResult};
use crate::types::SourceLocation;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

/// Stack frame
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StackFrame {
    pub id: i64,
    pub name: String,
    pub source: Option<SourceLocation>,
    pub line: Option<usize>,
    pub column: Option<usize>,
    pub end_line: Option<usize>,
    pub end_column: Option<usize>,
    pub can_restart: bool,
    pub instruction_pointer_reference: Option<i64>,
    pub module_id: Option<i64>,
}

impl StackFrame {
    pub fn new(id: i64, name: impl Into<String>) -> Self {
        Self {
            id,
            name: name.into(),
            source: None,
            line: None,
            column: None,
            end_line: None,
            end_column: None,
            can_restart: false,
            instruction_pointer_reference: None,
            module_id: None,
        }
    }

    pub fn with_source(mut self, source: SourceLocation) -> Self {
        self.source = Some(source);
        self
    }

    pub fn with_position(mut self, line: usize, column: usize) -> Self {
        self.line = Some(line);
        self.column = Some(column);
        self
    }

    pub fn with_range(mut self, start_line: usize, start_col: usize, end_line: usize, end_col: usize) -> Self {
        self.line = Some(start_line);
        self.column = Some(start_col);
        self.end_line = Some(end_line);
        self.end_column = Some(end_col);
        self
    }

    pub fn display_name(&self) -> String {
        if let Some(source) = &self.source {
            format!("{} at {}:{}", self.name, source.uri.path(), self.line.unwrap_or(0))
        } else {
            self.name.clone()
        }
    }
}

/// Call stack
#[derive(Debug, Clone)]
pub struct CallStack {
    frames: Arc<Mutex<Vec<StackFrame>>>,
    current_frame_id: Arc<Mutex<Option<i64>>>,
}

impl CallStack {
    pub fn new() -> Self {
        Self {
            frames: Arc::new(Mutex::new(Vec::new())),
            current_frame_id: Arc::new(Mutex::new(None)),
        }
    }

    pub fn set_frames(&self, frames: Vec<StackFrame>) -> DebugResult<()> {
        let mut frame_list = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        *frame_list = frames;
        Ok(())
    }

    pub fn get_frames(&self) -> DebugResult<Vec<StackFrame>> {
        let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(frames.clone())
    }

    pub fn get_frame(&self, id: i64) -> DebugResult<StackFrame> {
        let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        frames
            .iter()
            .find(|f| f.id == id)
            .cloned()
            .ok_or_else(|| DebugError::StackFrameNotFound)
    }

    pub fn get_current_frame(&self) -> DebugResult<Option<StackFrame>> {
        let current_id = self.current_frame_id.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        if let Some(id) = *current_id {
            self.get_frame(id).map(Some)
        } else {
            let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
            Ok(frames.first().cloned())
        }
    }

    pub fn set_current_frame(&self, id: i64) -> DebugResult<()> {
        let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        if frames.iter().any(|f| f.id == id) {
            let mut current_id = self.current_frame_id.lock().map_err(|e| DebugError::Other(e.to_string()))?;
            *current_id = Some(id);
            Ok(())
        } else {
            Err(DebugError::StackFrameNotFound)
        }
    }

    pub fn frame_count(&self) -> DebugResult<usize> {
        let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(frames.len())
    }

    pub fn is_empty(&self) -> DebugResult<bool> {
        let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(frames.is_empty())
    }

    pub fn clear(&self) -> DebugResult<()> {
        let mut frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        let mut current_id = self.current_frame_id.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        frames.clear();
        *current_id = None;
        Ok(())
    }

    pub fn display(&self) -> DebugResult<String> {
        let frames = self.frames.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        let mut result = String::new();

        for (idx, frame) in frames.iter().enumerate() {
            if idx > 0 {
                result.push('\n');
            }
            result.push_str(&frame.display_name());
        }

        Ok(result)
    }
}

impl Default for CallStack {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stack_frame() {
        let uri = lsp_types::Url::parse("file:///test.rs").unwrap();
        let frame = StackFrame::new(1, "main")
            .with_source(SourceLocation::new(uri, 10, 5))
            .with_position(10, 5);

        assert_eq!(frame.id, 1);
        assert_eq!(frame.name, "main");
        assert_eq!(frame.line, Some(10));
    }

    #[test]
    fn test_call_stack() {
        let stack = CallStack::new();

        let uri = lsp_types::Url::parse("file:///test.rs").unwrap();
        let frames = vec![
            StackFrame::new(1, "main")
                .with_source(SourceLocation::new(uri.clone(), 10, 5))
                .with_position(10, 5),
            StackFrame::new(2, "test")
                .with_source(SourceLocation::new(uri, 20, 5))
                .with_position(20, 5),
        ];

        stack.set_frames(frames).unwrap();
        assert_eq!(stack.frame_count().unwrap(), 2);

        let current = stack.get_current_frame().unwrap();
        assert!(current.is_some());
        assert_eq!(current.unwrap().id, 1);
    }
}
