use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Sidebar item
#[derive(Debug, Clone)]
pub struct SidebarItem {
    pub label: String,
    pub icon: Option<String>,
    pub action: Option<String>,
    pub children: Vec<SidebarItem>,
    pub expanded: bool,
}

impl SidebarItem {
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            icon: None,
            action: None,
            children: Vec::new(),
            expanded: false,
        }
    }

    pub fn with_icon(mut self, icon: impl Into<String>) -> Self {
        self.icon = Some(icon.into());
        self
    }

    pub fn with_action(mut self, action: impl Into<String>) -> Self {
        self.action = Some(action.into());
        self
    }

    pub fn with_children(mut self, children: Vec<SidebarItem>) -> Self {
        self.children = children;
        self
    }

    pub fn has_children(&self) -> bool {
        !self.children.is_empty()
    }
}

/// Sidebar state
#[derive(Debug, Clone)]
pub struct SidebarState {
    pub items: Vec<SidebarItem>,
    pub collapsed: bool,
    pub width: f32,
    pub min_width: f32,
    pub max_width: f32,
}

impl Default for SidebarState {
    fn default() -> Self {
        Self {
            items: Vec::new(),
            collapsed: false,
            width: 250.0,
            min_width: 50.0,
            max_width: 400.0,
        }
    }
}

impl SidebarState {
    pub fn new(items: Vec<SidebarItem>) -> Self {
        Self {
            items,
            collapsed: false,
            width: 250.0,
            min_width: 50.0,
            max_width: 400.0,
        }
    }

    pub fn with_width(mut self, width: f32) -> Self {
        self.width = width;
        self
    }

    pub fn toggle(&mut self) {
        self.collapsed = !self.collapsed;
    }

    pub fn collapse(&mut self) {
        self.collapsed = true;
    }

    pub fn expand(&mut self) {
        self.collapsed = false;
    }

    pub fn toggle_item(&mut self, index: usize) {
        if let Some(item) = self.items.get_mut(index) {
            item.expanded = !item.expanded;
        }
    }
}

/// Simple sidebar widget (legacy)
pub fn sidebar<R>(
    egui_ctx: &egui::Context,
    rsui_ctx: &RsuiContext,
    title: &str,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> egui::InnerResponse<R> {
    egui::SidePanel::left(egui::Id::new(title))
        .frame(crate::theme::panel_frame(&rsui_ctx.theme))
        .show(egui_ctx, add_contents)
}

/// Collapsible sidebar widget
///
/// Sidebar with collapse/expand functionality
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The sidebar state
/// * `title` - Optional title for the sidebar
/// * `content` - Function to render sidebar content
///
/// # Examples
/// ```no_run
/// use rsui::{sidebar_collapsible, context::RsuiContext, components::sidebar::{SidebarState, SidebarItem}};
///
/// let items = vec![
///     SidebarItem::new("Dashboard").with_icon("📊"),
///     SidebarItem::new("Settings").with_icon("⚙️"),
/// ];
/// let mut state = SidebarState::new(items);
/// sidebar_collapsible(ui, rsui_ctx, &mut state, Some("Menu"), |ui| {
///     ui.label("Content");
/// });
/// ```
pub fn sidebar_collapsible(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut SidebarState,
    title: Option<&str>,
    content: impl FnOnce(&mut Ui),
) {
    let theme = &rsui_ctx.theme;
    let target_width = if state.collapsed {
        state.min_width
    } else {
        state.width
    };

    egui::SidePanel::left("sidebar")
        .width_range(state.min_width..=state.max_width)
        .default_width(target_width)
        .frame(egui::Frame::none()
            .fill(theme.card)
            .stroke(egui::Stroke::new(1.0, theme.border))
        )
        .show_inside(ui, |ui| {
            ui.vertical(|ui| {
                // Header
                if let Some(t) = title {
                    ui.horizontal(|ui| {
                        if !state.collapsed {
                            ui.label(egui::RichText::new(t).strong().size(16.0).color(theme.foreground));
                        }
                        
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("☰").small().clicked() {
                                state.toggle();
                            }
                        });
                    });
                    ui.add_space(16.0);
                }

                // Content
                if !state.collapsed {
                    content(ui);
                }
            });
        });
}

/// Sidebar with nested menus
///
/// Sidebar with collapsible nested menu items
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The sidebar state
/// * `title` - Optional title for the sidebar
///
/// # Examples
/// ```no_run
/// use rsui::{sidebar_with_menus, context::RsuiContext, components::sidebar::{SidebarState, SidebarItem}};
///
/// let items = vec![
///     SidebarItem::new("File")
///         .with_icon("📁")
///         .with_children(vec![
///             SidebarItem::new("New").with_action("file.new"),
///             SidebarItem::new("Open").with_action("file.open"),
///         ]),
///     SidebarItem::new("Edit").with_icon("✏️️"),
/// ];
/// let mut state = SidebarState::new(items);
/// sidebar_with_menus(ui, rsui_ctx, &mut state, Some("Menu"));
/// ```
pub fn sidebar_with_menus(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut SidebarState,
    title: Option<&str>,
) {
    let theme = &rsui_ctx;
    let target_width = if state.collapsed {
        state.min_width
    } else {
        state.width
    };

    egui::SidePanel::left("sidebar")
        .width_range(state.min_width..=state.max_width)
        .default_width(target_width)
        .frame(egui::Frame::none()
            .fill(theme.card)
            .stroke(egui::Stroke::new(1.0, theme.border))
        )
        .show_inside(ui, |ui| {
            ui.vertical(|ui| {
                // Header
                if let Some(t) = title {
                    ui.horizontal(|ui| {
                        if !state.collapsed {
                            ui.label(egui::RichText::new(t).strong().size(16.0).color(theme.foreground));
                        }
                        
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("☰").small().clicked() {
                                state.toggle();
                            }
                        });
                    });
                    ui.add_space(16.0);
                }

                // Menu items
                render_menu_items(ui, rsui_ctx, state, &state.items, 0);
            });
        });
}

fn render_menu_items(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut SidebarState,
    items: &[SidebarItem],
    depth: usize,
) {
    for (index, item) in items.iter().enumerate() {
        let indent = depth * 16.0;
        
        ui.horizontal(|ui| {
            ui.add_space(indent);
            
            // Expand/collapse button for items with children
            if item.has_children() {
                let icon = if item.expanded { "▼" } else { "▶" };
                if ui.button(icon).small().clicked() {
                    state.toggle_item(index);
                }
            }
            
            // Item label
            if let Some(icon) = &item.icon {
                ui.label(format!("{} {}", icon, item.label));
            } else {
                ui.label(&item.label);
            }
        });

        // Render children if expanded
        if item.expanded && item.has_children() {
            render_menu_items(ui, rsui_ctx, state, &item.children, depth + 1);
        }
    }
}

/// Sidebar with custom item renderer
///
/// Sidebar with custom item rendering
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The sidebar state
/// * `render_item` - Custom item renderer
/// * `title` - Optional title for the sidebar
///
/// # Examples
/// ```no_run
/// use rsui::{sidebar_with_renderer, context::RsuiContext, components::sidebar::{SidebarState, SidebarItem}};
///
/// let items = vec![SidebarItem::new("Home")];
/// let mut state = SidebarState::new(items);
/// sidebar_with_renderer(ui, rsui_ctx, &mut state, |ui, item| {
///     ui.label(format!("→ {}", item.label));
/// }, Some("Menu"));
/// ```
pub fn sidebar_with_renderer(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut SidebarState,
    render_item: impl Fn(&mut Ui, &SidebarItem),
    title: Option<&str>,
) {
    let theme = &rsui_ctx.theme;
    let target_width = if state.collapsed {
        state.min_width
    } else {
        state.width
    };

    egui::SidePanel::left("sidebar")
        .width_range(state.min_width..=state.max_width)
        .default_width(target_width)
        .frame(egui::Frame::none()
            .fill(theme.card)
            .stroke(egui::Stroke::new(1.0, theme.border))
        )
        .show_inside(ui, |ui| {
            ui.vertical(|ui| {
                // Header
                if let Some(t) = title {
                    ui.horizontal(|ui| {
                        if !state.collapsed {
                            ui.label(egui::RichText::new(t).strong().size(16.0).color(theme.foreground));
                        }
                        
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("☰").small().clicked() {
                                state.toggle();
                            }
                        });
                    });
                    ui.add_space(16.0);
                }

                // Items
                if !state.collapsed {
                    for item in &state.items {
                        render_item(ui, item);
                    }
                }
            });
        });
}

/// Sidebar with active state
///
/// Sidebar with active item highlighting
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The sidebar state
/// * `active_item` - Index of the active item
/// * `title` - Optional title for the sidebar
///
/// # Examples
/// ```no_run
/// use rsui::{sidebar_with_active, context::RsuiContext, components::sidebar::{SidebarState, SidebarItem}};
///
/// let items = vec![
///     SidebarItem::new("Home"),
///     SidebarItem::new("About"),
///     SidebarItem::new("Contact"),
/// ];
/// let mut state = SidebarState::new(items);
/// sidebar_with_active(ui, rsui_ctx, &mut state, Some(1), Some("Menu"));
/// ```
pub fn sidebar_with_active(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut SidebarState,
    active_item: Option<usize>,
    title: Option<&str>,
) {
    let theme = &rsui_ctx.theme;
    let target_width = if state.collapsed {
        state.min_width
    } else {
        state.width
    };

    egui::SidePanel::left("sidebar")
        .width_range(state.min_width..=state.max_width)
        .default_width(target_width)
        .frame(egui::Frame::none()
            .fill(theme.card)
            .stroke(egui::Stroke::new(1.0, theme.border))
        )
        .show_inside(ui, |ui| {
            ui.vertical(|ui| {
                // Header
                if let Some(t) = title {
                    ui.horizontal(|ui| {
                        if !state.collapsed {
                            ui.label(egui::RichText::new(t).strong().size(16.0).color(theme.foreground));
                        }
                        
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("☰").small().clicked() {
                                state.toggle();
                            }
                        });
                    });
                    ui.add_space(16.0);
                }

                // Items with active state
                if !state.collapsed {
                    for (index, item) in &state.items.iter().enumerate() {
                        let is_active = active_item == Some(index);
                        
                        let response = if is_active {
                            ui.button(&item.label).fill(theme.primary)
                        } else {
                            ui.button(&item.label)
                        };
                        
                        if response.clicked() {
                            // Handle item click
                            if let Some(action) = &item.action {
                                println!("Action: {}", action);
                            }
                        }
                    }
                }
            });
        });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sidebar_item() {
        let item = SidebarItem::new("Home")
            .with_icon("🏠")
            .with_action("home.navigate");
        
        assert_eq!(item.label, "Home");
        assert_eq!(item.icon, Some("🏠".to_string()));
        assert_eq!(item.action, Some("home.navigate".to_string()));
        assert!(!item.has_children());
    }

    #[test]
    fn test_sidebar_item_with_children() {
        let item = SidebarItem::new("File")
            .with_children(vec![
                SidebarItem::new("New"),
                SidebarItem::new("Open"),
            ]);
        
        assert!(item.has_children());
        assert_eq!(item.children.len(), 2);
    }

    #[test]
    fn test_sidebar_state() {
        let items = vec![SidebarItem::new("Home"), SidebarItem::new("Settings")];
        let mut state = SidebarState::new(items);
        
        assert!(!state.collapsed);
        assert_eq!(state.width, 250.0);
        
        state.toggle();
        assert!(state.collapsed);
        
        state.expand();
        assert!(!state.collapsed);
    }

    #[test]
    fn test_sidebar_state_with_width() {
        let items = vec![SidebarItem::new("Home")];
        let state = SidebarState::new(items).with_width(300.0);
        
        assert_eq!(state.width, 300.0);
        assert_eq!(state.max_width, 400.0);
        assert_eq!(state.min_width, 50.0);
    }
}
