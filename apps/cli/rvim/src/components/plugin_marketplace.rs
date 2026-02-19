use ratatui::{
    layout::Rect,
    style::{Color, Modifier, Style},
    widgets::{Block, Borders, List, ListItem, Paragraph},
    Frame,
};

// Placeholder for a plugin's metadata
struct Plugin {
    name: String,
    description: String,
    version: String,
}

pub struct PluginMarketplace {
    plugins: Vec<Plugin>,
    selected_index: usize,
    is_visible: bool,
}

impl Default for PluginMarketplace {
    fn default() -> Self {
        Self::new()
    }
}

impl PluginMarketplace {
    pub fn new() -> Self {
        // In a real implementation, this would fetch plugins from a remote source.
        let plugins = vec![
            Plugin {
                name: "rvim-lsp".to_string(),
                description: "LSP support for rvim".to_string(),
                version: "0.1.0".to_string(),
            },
            Plugin {
                name: "rvim-git".to_string(),
                description: "Git integration for rvim".to_string(),
                version: "0.1.0".to_string(),
            },
        ];

        Self {
            plugins,
            selected_index: 0,
            is_visible: false,
        }
    }

    pub fn set_visible(&mut self, visible: bool) {
        self.is_visible = visible;
    }

    pub fn render(&self, frame: &mut Frame, area: Rect) {
        if !self.is_visible {
            return;
        }

        let items: Vec<ListItem> = self
            .plugins
            .iter()
            .map(|p| ListItem::new(format!("{} (v{}): {}", p.name, p.version, p.description)))
            .collect();

        let list = List::new(items)
            .block(
                Block::default()
                    .borders(Borders::ALL)
                    .title("Plugin Marketplace"),
            )
            .highlight_style(
                Style::default()
                    .add_modifier(Modifier::BOLD)
                    .bg(Color::Blue),
            );

        frame.render_widget(list, area);
    }
}
