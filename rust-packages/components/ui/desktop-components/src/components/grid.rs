use crate::context::RsuiContext;
use eframe::egui::{self, Ui, Vec2};

/// Grid layout configuration
#[derive(Debug, Clone)]
pub struct GridConfig {
    pub columns: usize,
    pub gap: f32,
    pub min_column_width: f32,
}

impl Default for GridConfig {
    fn default() -> Self {
        Self {
            columns: 12,
            gap: 16.0,
            min_column_width: 200.0,
        }
    }
}

impl GridConfig {
    pub fn new(columns: usize, gap: f32) -> Self {
        Self {
            columns,
            gap,
            ..Default::default()
        }
    }

    pub fn with_min_width(mut self, width: f32) -> Self {
        self.min_column_width = width;
        self
    }
}

/// Grid layout widget
///
/// Creates a responsive grid layout with configurable columns and gaps
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `config` - The grid configuration
/// * `content` - The content to render in each grid cell
///
/// # Examples
/// ```no_run
/// use rsui::{grid, context::RsuiContext, components::grid::GridConfig};
///
/// let config = GridConfig::new(3, 16.0);
/// grid(ui, rsui_ctx, config, |ui| {
///     ui.label("Cell 1");
/// });
/// ```
pub fn grid(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    config: GridConfig,
    mut content: impl FnMut(&mut Ui),
) {
    let available_width = ui.available_width();
    let total_gap_width = (config.columns - 1) as f32 * config.gap;
    let column_width = (available_width - total_gap_width) / config.columns as f32;

    // Calculate actual columns based on minimum width
    let actual_columns = if column_width < config.min_column_width {
        let max_columns = (available_width / (config.min_column_width + config.gap)).floor() as usize;
        max_columns.max(1)
    } else {
        config.columns
    };

    let actual_column_width = (available_width - (actual_columns - 1) as f32 * config.gap) / actual_columns as f32;

    ui.vertical(|ui| {
        ui.horizontal(|ui| {
            for i in 0..actual_columns {
                if i > 0 {
                    ui.add_space(config.gap);
                }

                ui.allocate_ui_with_layout(
                    Vec2::new(actual_column_width, ui.available_height()),
                    egui::Layout::top_down(egui::Align::LEFT),
                    |ui| {
                        content(ui);
                    },
                );
            }
        });
    });
}

/// Grid item wrapper
///
/// Wraps content in a grid cell
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `span` - Number of columns to span
/// * `content` - The content to render
///
/// # Examples
/// ```no_run
/// use rsui::{grid_item, context::RsuiContext};
///
/// grid_item(ui, rsui_ctx, 2, |ui| {
///     ui.label("Spans 2 columns");
/// });
/// ```
pub fn grid_item(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    span: usize,
    content: impl FnOnce(&mut Ui),
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(16.0, 16.0))
        .show(ui, |ui| {
            content(ui);
        });
}

/// Responsive grid that adjusts columns based on available width
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `min_width` - Minimum width for each column
/// * `gap` - Gap between columns
/// * `content` - The content to render
///
/// # Examples
/// ```no_run
/// use rsui::{responsive_grid, context::RsuiContext};
///
/// responsive_grid(ui, rsui_ctx, 200.0, 16.0, |ui| {
///     ui.label("Responsive cell");
/// });
/// ```
pub fn responsive_grid(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    min_width: f32,
    gap: f32,
    content: impl FnMut(&mut Ui),
) {
    let available_width = ui.available_width();
    let columns = (available_width / (min_width + gap)).floor() as usize;
    let actual_columns = columns.max(1);

    let config = GridConfig::new(actual_columns, gap).with_min_width(min_width);
    grid(ui, rsui_ctx, config, content);
}
