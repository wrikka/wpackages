use anyhow::Result;
use ratatui::{
    layout::Rect,
    style::{Modifier, Style},
    widgets::{Block, Borders, List, ListItem},
    Frame,
};
use streaming_iterator::StreamingIterator;
use tree_sitter::{Query, QueryCursor, Tree};

struct Symbol {
    name: String,
    kind: String,
}

pub struct CodeOutline {
    symbols: Vec<Symbol>,
    is_visible: bool,
}

impl Default for CodeOutline {
    fn default() -> Self {
        Self::new()
    }
}

impl CodeOutline {
    pub fn new() -> Self {
        Self {
            symbols: Vec::new(),
            is_visible: false,
        }
    }

    pub fn set_visible(&mut self, visible: bool) {
        self.is_visible = visible;
    }

    pub fn update_symbols(
        &mut self,
        tree: &Tree,
        source_code: &str,
        language_query: &str,
    ) -> Result<()> {
        self.symbols.clear();
        let language = tree.language();
        let query = Query::new(&language, language_query)?;
        let mut cursor = QueryCursor::new();
        let mut matches = cursor.matches(&query, tree.root_node(), source_code.as_bytes());

        while let Some(mat) = matches.next() {
            for cap in mat.captures {
                let node = cap.node;
                let name = node
                    .utf8_text(source_code.as_bytes())
                    .unwrap_or("")
                    .to_string();
                let kind = query.capture_names()[cap.index as usize].to_string();
                self.symbols.push(Symbol { name, kind });
            }
        }
        Ok(())
    }

    pub fn render(&self, frame: &mut Frame, area: Rect) {
        if !self.is_visible {
            return;
        }

        let items: Vec<ListItem> = self
            .symbols
            .iter()
            .map(|s| ListItem::new(format!("[{}] {}", s.kind, s.name)))
            .collect();

        let list =
            List::new(items).block(Block::default().borders(Borders::ALL).title("Code Outline"));

        frame.render_widget(list, area);
    }
}
