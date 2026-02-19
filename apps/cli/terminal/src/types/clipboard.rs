use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum ClipboardFormat {
    PlainText,
    HTML,
    RTF,
    Image,
    Custom(String),
}

impl Default for ClipboardFormat {
    fn default() -> Self {
        Self::PlainText
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClipboardItem {
    pub id: String,
    pub content: String,
    pub format: ClipboardFormat,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub source: Option<String>,
    pub size_bytes: usize,
}

impl ClipboardItem {
    pub fn new(content: String, format: ClipboardFormat) -> Self {
        let size_bytes = content.len();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            content,
            format,
            timestamp: chrono::Utc::now(),
            source: None,
            size_bytes,
        }
    }

    pub fn with_source(mut self, source: String) -> Self {
        self.source = Some(source);
        self
    }

    pub fn is_text(&self) -> bool {
        matches!(
            self.format,
            ClipboardFormat::PlainText | ClipboardFormat::HTML | ClipboardFormat::RTF
        )
    }

    pub fn is_image(&self) -> bool {
        matches!(self.format, ClipboardFormat::Image)
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClipboardHistory {
    pub items: Vec<ClipboardItem>,
    pub max_items: usize,
    pub max_size_bytes: usize,
    pub persistent: bool,
}

impl Default for ClipboardHistory {
    fn default() -> Self {
        Self {
            items: Vec::new(),
            max_items: 100,
            max_size_bytes: 10 * 1024 * 1024, // 10MB
            persistent: true,
        }
    }
}

impl ClipboardHistory {
    pub fn new(max_items: usize, max_size_bytes: usize) -> Self {
        Self {
            items: Vec::new(),
            max_items,
            max_size_bytes,
            persistent: true,
        }
    }

    pub fn add_item(&mut self, item: ClipboardItem) {
        // Check size limit
        if item.size_bytes > self.max_size_bytes {
            return;
        }

        // Remove duplicates
        self.items.retain(|i| i.content != item.content);

        // Add new item
        self.items.insert(0, item);

        // Enforce max items limit
        if self.items.len() > self.max_items {
            self.items.truncate(self.max_items);
        }
    }

    pub fn get_latest(&self) -> Option<&ClipboardItem> {
        self.items.first()
    }

    pub fn get_item(&self, id: &str) -> Option<&ClipboardItem> {
        self.items.iter().find(|i| i.id == id)
    }

    pub fn search(&self, query: &str) -> Vec<&ClipboardItem> {
        let query_lower = query.to_lowercase();
        self.items
            .iter()
            .filter(|i| i.content.to_lowercase().contains(&query_lower))
            .collect()
    }

    pub fn clear(&mut self) {
        self.items.clear();
    }

    pub fn remove_item(&mut self, id: &str) {
        self.items.retain(|i| i.id != id);
    }

    pub fn get_total_size(&self) -> usize {
        self.items.iter().map(|i| i.size_bytes).sum()
    }

    pub fn is_over_limit(&self) -> bool {
        self.get_total_size() > self.max_size_bytes
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClipboardSelection {
    pub start_line: usize,
    pub start_col: usize,
    pub end_line: usize,
    pub end_col: usize,
    pub text: String,
}

impl ClipboardSelection {
    pub fn new(
        start_line: usize,
        start_col: usize,
        end_line: usize,
        end_col: usize,
        text: String,
    ) -> Self {
        Self {
            start_line,
            start_col,
            end_line,
            end_col,
            text,
        }
    }

    pub fn is_empty(&self) -> bool {
        self.text.is_empty()
    }

    pub fn line_count(&self) -> usize {
        self.end_line - self.start_line + 1
    }

    pub fn char_count(&self) -> usize {
        self.text.len()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClipboardConfig {
    pub history_enabled: bool,
    pub max_history_items: usize,
    pub max_item_size_bytes: usize,
    pub auto_copy_selection: bool,
    pub copy_on_select: bool,
    pub strip_ansi_codes: bool,
    pub trim_whitespace: bool,
}

impl Default for ClipboardConfig {
    fn default() -> Self {
        Self {
            history_enabled: true,
            max_history_items: 100,
            max_item_size_bytes: 1024 * 1024, // 1MB
            auto_copy_selection: false,
            copy_on_select: false,
            strip_ansi_codes: true,
            trim_whitespace: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClipboardState {
    pub config: ClipboardConfig,
    pub history: ClipboardHistory,
    pub current_selection: Option<ClipboardSelection>,
}

impl Default for ClipboardState {
    fn default() -> Self {
        Self {
            config: ClipboardConfig::default(),
            history: ClipboardHistory::default(),
            current_selection: None,
        }
    }
}

impl ClipboardState {
    pub fn new(config: ClipboardConfig) -> Self {
        Self {
            history: ClipboardHistory::new(config.max_history_items, config.max_item_size_bytes),
            config,
            current_selection: None,
        }
    }

    pub fn set_selection(&mut self, selection: ClipboardSelection) {
        self.current_selection = Some(selection);
    }

    pub fn clear_selection(&mut self) {
        self.current_selection = None;
    }

    pub fn has_selection(&self) -> bool {
        self.current_selection.is_some()
    }
}
