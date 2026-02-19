use crate::context::RsuiContext;
use eframe::egui::{self, Ui, Vec2};

/// Virtual scroll configuration
#[derive(Debug, Clone)]
pub struct VirtualScrollConfig {
    pub item_height: f32,
    pub viewport_height: f32,
    pub overscan_count: usize,
}

impl Default for VirtualScrollConfig {
    fn default() -> Self {
        Self {
            item_height: 50.0,
            viewport_height: 400.0,
            overscan_count: 5,
        }
    }
}

impl VirtualScrollConfig {
    pub fn new(item_height: f32, viewport_height: f32) -> Self {
        Self {
            item_height,
            viewport_height,
            ..Default::default()
        }
    }

    pub fn with_overscan(mut self, count: usize) -> Self {
        self.overscan_count = count;
        self
    }
}

/// Virtual scroll state
#[derive(Debug, Clone)]
pub struct VirtualScrollState {
    pub scroll_offset: f32,
    pub total_items: usize,
}

impl Default for VirtualScrollState {
    fn default() -> Self {
        Self {
            scroll_offset: 0.0,
            total_items: 0,
        }
    }
}

impl VirtualScrollState {
    pub fn new(total_items: usize) -> Self {
        Self {
            total_items,
            ..Default::default()
        }
    }

    pub fn visible_range(&self, config: &VirtualScrollConfig) -> (usize, usize) {
        let start_index = (self.scroll_offset / config.item_height).floor() as usize;
        let visible_count = (config.viewport_height / config.item_height).ceil() as usize;
        let end_index = (start_index + visible_count + config.overscan_count).min(self.total_items);
        let start_index = start_index.saturating_sub(config.overscan_count);

        (start_index, end_index)
    }

    pub fn total_height(&self, config: &VirtualScrollConfig) -> f32 {
        self.total_items as f32 * config.item_height
    }

    pub fn scroll_to_index(&mut self, index: usize, config: &VirtualScrollConfig) {
        if index < self.total_items {
            self.scroll_offset = index as f32 * config.item_height;
        }
    }
}

/// Virtual scroll widget
///
/// Renders only visible items for performance with large lists
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The virtual scroll state
/// * `config` - The virtual scroll configuration
/// * `render_item` - Function to render each item
///
/// # Examples
/// ```no_run
/// use rsui::{virtual_scroll, context::RsuiContext, components::virtual_scroll::{VirtualScrollState, VirtualScrollConfig}};
///
/// let mut state = VirtualScrollState::new(1000);
/// let config = VirtualScrollConfig::new(50.0, 400.0);
/// virtual_scroll(ui, rsui_ctx, &mut state, config, |ui, index| {
///     ui.label(format!("Item {}", index));
/// });
/// ```
pub fn virtual_scroll<T>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut VirtualScrollState,
    config: VirtualScrollConfig,
    render_item: impl Fn(&mut Ui, usize, &T),
    items: &[T],
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(0, 0))
        .show(ui, |ui| {
            // Calculate visible range
            let (start_index, end_index) = state.visible_range(&config);
            let total_height = state.total_height(&config);

            // Scroll area
            let scroll_response = egui::ScrollArea::vertical()
                .max_height(config.viewport_height)
                .show(ui, |ui| {
                    // Spacer to create scrollable area
                    ui.add_space(state.scroll_offset);

                    // Render visible items
                    for index in start_index..end_index {
                        if let Some(item) = items.get(index) {
                            render_item(ui, index, item);
                        }
                    }

                    // Spacer for remaining items
                    let remaining_height = total_height - state.scroll_offset - (end_index - start_index) as f32 * config.item_height;
                    ui.add_space(remaining_height.max(0.0));
                });

            // Update scroll offset
            state.scroll_offset = scroll_response.state.offset.y;
        });
}

/// Simple virtual list
///
/// A simplified version of virtual scroll for basic use cases
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `items` - The list of items
/// * `item_height` - Height of each item
/// * `render_item` - Function to render each item
///
/// # Examples
/// ```no_run
/// use rsui::{virtual_list, context::RsuiContext};
///
/// let items: Vec<String> = (0..1000).map(|i| format!("Item {}", i)).collect();
/// virtual_list(ui, rsui_ctx, &items, 50.0, |ui, index, item| {
///     ui.label(item);
/// });
/// ```
pub fn virtual_list<T>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    items: &[T],
    item_height: f32,
    render_item: impl Fn(&mut Ui, usize, &T),
) {
    let viewport_height = ui.available_height();
    let config = VirtualScrollConfig::new(item_height, viewport_height);
    let mut state = VirtualScrollState::new(items.len());
    
    virtual_scroll(ui, rsui_ctx, &mut state, config, render_item, items);
}

/// Virtual grid for 2D layouts
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The virtual scroll state
/// * `config` - The virtual scroll configuration
/// * `columns` - Number of columns
/// * `render_item` - Function to render each item
/// * `items` - The list of items
///
/// # Examples
/// ```no_run
/// use rsui::{virtual_grid, context::RsuiContext, components::virtual_scroll::{VirtualScrollState, VirtualScrollConfig}};
///
/// let mut state = VirtualScrollState::new(1000);
/// let config = VirtualScrollConfig::new(100.0, 400.0);
/// let items: Vec<String> = (0..1000).map(|i| format!("Item {}", i)).collect();
/// virtual_grid(ui, rsui_ctx, &mut state, config, 3, |ui, index, item| {
///     ui.label(item);
/// }, &items);
/// ```
pub fn virtual_grid<T>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut VirtualScrollState,
    config: VirtualScrollConfig,
    columns: usize,
    render_item: impl Fn(&mut Ui, usize, &T),
    items: &[T],
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .show(ui, |ui| {
            let available_width = ui.available_width();
            let column_width = (available_width - (columns - 1) as f32 * 8.0) / columns as f32;
            let rows = (items.len() + columns - 1) / columns;
            let total_height = rows as f32 * config.item_height;

            let scroll_response = egui::ScrollArea::vertical()
                .max_height(config.viewport_height)
                .show(ui, |ui| {
                    ui.add_space(state.scroll_offset);

                    let (start_index, end_index) = state.visible_range(&config);
                    let start_row = start_index / columns;
                    let end_row = (end_index + columns - 1) / columns;

                    for row in start_row..end_row {
                        ui.horizontal(|ui| {
                            for col in 0..columns {
                                let index = row * columns + col;
                                if index < items.len() {
                                    ui.allocate_ui_with_layout(
                                        Vec2::new(column_width, config.item_height),
                                        egui::Layout::top_down(egui::Align::Center),
                                        |ui| {
                                            if let Some(item) = items.get(index) {
                                                render_item(ui, index, item);
                                            }
                                        },
                                    );
                                }
                                
                                if col < columns - 1 {
                                    ui.add_space(8.0);
                                }
                            }
                        });
                    }

                    let remaining_height = total_height - state.scroll_offset - (end_row - start_row) as f32 * config.item_height;
                    ui.add_space(remaining_height.max(0.0));
                });

            state.scroll_offset = scroll_response.state.offset.y;
        });
}
