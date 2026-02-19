use std::path::PathBuf;

use crate::error::Result;
use crate::services::editor_context::EditorContext;
use crate::services::tree_sitter::SyntaxHighlight;

use super::mode::Mode;

pub struct EditorState {
    pub(super) mode: Mode,
    pub(super) cursor_x: usize,
    pub(super) cursor_y: usize,
    pub(super) scroll_offset: usize,
    pub(super) content: Vec<String>,
    pub(super) file_path: Option<PathBuf>,
    pub(super) context: EditorContext,
    pub(super) language: String,
    pub(super) syntax_highlights: Vec<(usize, usize, SyntaxHighlight)>,
}

impl EditorState {
    pub fn new(config: &crate::config::AppConfig) -> Result<Self> {
        let context = EditorContext::new(config)?;

        Ok(Self {
            mode: Mode::Normal,
            cursor_x: 0,
            cursor_y: 0,
            scroll_offset: 0,
            content: vec![String::new()],
            file_path: None,
            context,
            language: "text".to_string(),
            syntax_highlights: Vec::new(),
        })
    }

    pub fn mode(&self) -> Mode {
        self.mode
    }

    pub fn set_mode(&mut self, mode: Mode) {
        let old_mode = self.mode;
        self.mode = mode;

        if old_mode != mode {
            let _ = self.context.plugin_system_mut().emit_event(
                crate::services::plugins::PluginEvent::ModeChanged(format!("{:?}", mode)),
            );
        }
    }

    pub fn cursor_position(&self) -> (usize, usize) {
        (self.cursor_x, self.cursor_y)
    }

    pub fn set_cursor_position(&mut self, x: usize, y: usize) {
        self.cursor_x = x;
        self.cursor_y = y;

        let _ = self
            .context
            .plugin_system_mut()
            .emit_event(crate::services::plugins::PluginEvent::CursorMoved { line: y, col: x });
    }

    pub fn scroll_offset(&self) -> usize {
        self.scroll_offset
    }

    pub fn set_scroll_offset(&mut self, offset: usize) {
        self.scroll_offset = offset;
    }

    pub fn content(&self) -> &[String] {
        &self.content
    }

    pub fn file_path(&self) -> Option<&PathBuf> {
        self.file_path.as_ref()
    }

    pub fn set_file_path(&mut self, path: PathBuf) -> Result<()> {
        self.file_path = Some(path.clone());

        let tree_sitter = self.context.tree_sitter();
        let ts = tokio::runtime::Handle::current().block_on(async { tree_sitter.lock().await });
        self.language = ts.detect_language(&path);

        self.context.plugin_system_mut().emit_event(
            crate::services::plugins::PluginEvent::FileOpened(path.to_string_lossy().to_string()),
        )?;
        Ok(())
    }

    pub fn language(&self) -> &str {
        &self.language
    }

    pub fn syntax_highlights(&self) -> &[(usize, usize, SyntaxHighlight)] {
        &self.syntax_highlights
    }

    pub fn update_syntax_highlighting(&mut self) -> Result<()> {
        let source = self.content.join("\n");
        let tree_sitter = self.context.tree_sitter();
        let mut ts = tokio::runtime::Handle::current().block_on(async { tree_sitter.lock().await });

        self.syntax_highlights = ts.highlight(&source, &self.language)?;
        Ok(())
    }

    pub fn theme(&self) -> &crate::services::theme::ThemeService {
        &self.context.theme
    }

    pub fn plugin_system(&self) -> &crate::services::plugins::PluginSystem {
        self.context.plugin_system()
    }

    pub fn plugin_system_mut(&mut self) -> &mut crate::services::plugins::PluginSystem {
        self.context.plugin_system_mut()
    }

    pub(super) fn current_line(&self) -> &str {
        if self.cursor_y < self.content.len() {
            &self.content[self.cursor_y]
        } else {
            ""
        }
    }

    pub(super) fn current_line_len(&self) -> usize {
        self.current_line().len()
    }

    pub(super) fn clamp_cursor_x(&mut self) {
        let line_len = self.current_line_len();
        if self.cursor_x > line_len {
            self.cursor_x = line_len;
        }
    }
}
