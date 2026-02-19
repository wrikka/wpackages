use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Lazy load state
#[derive(Debug, Clone)]
pub enum LazyLoadState<T> {
    NotLoaded,
    Loading,
    Loaded(T),
    Error(String),
}

impl<T> Default for LazyLoadState<T> {
    fn default() -> Self {
        Self::NotLoaded
    }
}

impl<T> LazyLoadState<T> {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_loaded(&self) -> bool {
        matches!(self, Self::Loaded(_))
    }

    pub fn is_loading(&self) -> bool {
        matches!(self, Self::Loading)
    }

    pub fn is_error(&self) -> bool {
        matches!(self, Self::Error(_))
    }

    pub fn get(&self) -> Option<&T> {
        match self {
            Self::Loaded(data) => Some(data),
            _ => None,
        }
    }

    pub fn get_mut(&mut self) -> Option<&mut T> {
        match self {
            Self::Loaded(data) => Some(data),
            _ => None,
        }
    }

    pub fn map<U, F>(self, f: F) -> LazyLoadState<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Self::Loaded(data) => LazyLoadState::Loaded(f(data)),
            Self::Loading => LazyLoadState::Loading,
            Self::Error(msg) => LazyLoadState::Error(msg),
            Self::NotLoaded => LazyLoadState::NotLoaded,
        }
    }
}

/// Lazy load widget
///
/// Loads content only when visible or requested
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The lazy load state
/// * `load_fn` - Function to load the data
/// * `render_fn` - Function to render the loaded data
///
/// # Examples
/// ```no_run
/// use rsui::{lazy_load, context::RsuiContext, components::lazy_load::LazyLoadState};
///
/// let mut state = LazyLoadState::new();
/// lazy_load(ui, rsui_ctx, &mut state, || {
///     // Simulate loading
///     Ok("Loaded data".to_string())
/// }, |ui, data| {
///     ui.label(data);
/// });
/// ```
pub fn lazy_load<T, E>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut LazyLoadState<T>,
    load_fn: impl FnOnce() -> Result<T, E>,
    render_fn: impl FnOnce(&mut Ui, &T),
) where
    E: std::fmt::Display,
{
    let theme = &rsui_ctx.theme;

    match state {
        LazyLoadState::NotLoaded => {
            // Check if widget is visible
            if ui.is_visible() {
                *state = LazyLoadState::Loading;
                
                // Load data
                match load_fn() {
                    Ok(data) => {
                        *state = LazyLoadState::Loaded(data);
                    }
                    Err(err) => {
                        *state = LazyLoadState::Error(err.to_string());
                    }
                }
            } else {
                // Show placeholder
                ui.centered_and_justified(|ui| {
                    ui.label(egui::RichText::new("Loading...").color(theme.card_foreground));
                });
            }
        }
        LazyLoadState::Loading => {
            // Show loading spinner
            ui.centered_and_justified(|ui| {
                ui.spinner();
                ui.label(egui::RichText::new("Loading...").color(theme.card_foreground));
            });
        }
        LazyLoadState::Loaded(data) => {
            // Render loaded content
            render_fn(ui, data);
        }
        LazyLoadState::Error(err) => {
            // Show error message
            egui::Frame::none()
                .fill(theme.destructive)
                .stroke(egui::Stroke::new(1.0, theme.destructive))
                .rounding(theme.radius)
                .inner_margin(egui::Margin::symmetric(16.0, 16.0))
                .show(ui, |ui| {
                    ui.vertical_centered(|ui| {
                        ui.label(egui::RichText::new("⚠️").size(32.0));
                        ui.label(
                            egui::RichText::new("Failed to load")
                                .size(16.0)
                                .color(theme.destructive_foreground),
                        );
                        ui.label(
                            egui::RichText::new(err)
                                .size(14.0)
                                .color(theme.destructive_foreground),
                        );
                    });
                });
        }
    }
}

/// Lazy load on click
///
/// Loads content only when user clicks a button
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The lazy load state
/// * `button_text` - Text for the load button
/// * `load_fn` - Function to load the data
/// * `render_fn` - Function to render the loaded data
///
/// # Examples
/// ```no_run
/// use rsui::{lazy_load_on_click, context::RsuiContext, components::lazy_load::LazyLoadState};
///
/// let mut state = LazyLoadState::new();
/// lazy_load_on_click(ui, rsui_ctx, &mut state, "Load Data", || {
///     Ok("Loaded data".to_string())
/// }, |ui, data| {
///     ui.label(data);
/// });
/// ```
pub fn lazy_load_on_click<T, E>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut LazyLoadState<T>,
    button_text: &str,
    load_fn: impl FnOnce() -> Result<T, E>,
    render_fn: impl FnOnce(&mut Ui, &T),
) where
    E: std::fmt::Display,
{
    match state {
        LazyLoadState::NotLoaded => {
            if ui.button(button_text).clicked() {
                *state = LazyLoadState::Loading;
                
                match load_fn() {
                    Ok(data) => {
                        *state = LazyLoadState::Loaded(data);
                    }
                    Err(err) => {
                        *state = LazyLoadState::Error(err.to_string());
                    }
                }
            }
        }
        LazyLoadState::Loading => {
            ui.spinner();
            ui.label("Loading...");
        }
        LazyLoadState::Loaded(data) => {
            render_fn(ui, data);
        }
        LazyLoadState::Error(err) => {
            ui.label(egui::RichText::new(err).color(rsui_ctx.theme.destructive));
            if ui.button("Retry").clicked() {
                *state = LazyLoadState::NotLoaded;
            }
        }
    }
}

/// Lazy load with skeleton
///
/// Shows skeleton placeholder while loading
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The lazy load state
/// * `load_fn` - Function to load the data
/// * `render_fn` - Function to render the loaded data
/// * `skeleton_fn` - Function to render skeleton
///
/// # Examples
/// ```no_run
/// use rsui::{lazy_load_with_skeleton, context::RsuiContext, components::lazy_load::LazyLoadState};
///
/// let mut state = LazyLoadState::new();
/// lazy_load_with_skeleton(ui, rsui_ctx, &mut state, || {
///     Ok("Loaded data".to_string())
/// }, |ui, data| {
///     ui.label(data);
/// }, |ui| {
///     ui.label("Skeleton placeholder");
/// });
/// ```
pub fn lazy_load_with_skeleton<T, E>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut LazyLoadState<T>,
    load_fn: impl FnOnce() -> Result<T, E>,
    render_fn: impl FnOnce(&mut Ui, &T),
    skeleton_fn: impl FnOnce(&mut Ui),
) where
    E: std::fmt::Display,
{
    match state {
        LazyLoadState::NotLoaded => {
            if ui.is_visible() {
                *state = LazyLoadState::Loading;
                
                match load_fn() {
                    Ok(data) => {
                        *state = LazyLoadState::Loaded(data);
                    }
                    Err(err) => {
                        *state = LazyLoadState::Error(err.to_string());
                    }
                }
            } else {
                skeleton_fn(ui);
            }
        }
        LazyLoadState::Loading => {
            skeleton_fn(ui);
        }
        LazyLoadState::Loaded(data) => {
            render_fn(ui, data);
        }
        LazyLoadState::Error(err) => {
            ui.label(egui::RichText::new(err).color(rsui_ctx.theme.destructive));
        }
    }
}

/// Async lazy load helper
///
/// Note: This is a placeholder for async loading.
/// Actual async loading would require async runtime integration.
///
/// # Arguments
/// * `state` - The lazy load state
/// * `future` - The future to await
///
/// # Examples
/// ```no_run
/// use rsui::components::lazy_load::{LazyLoadState, async_lazy_load};
///
/// let mut state = LazyLoadState::new();
/// async_lazy_load(&mut state, async {
///     // Async operation
///     Ok("Loaded data".to_string())
/// });
/// ```
pub fn async_lazy_load<T, E, F>(
    state: &mut LazyLoadState<T>,
    future: F,
) where
    F: std::future::Future<Output = Result<T, E>>,
    E: std::fmt::Display,
{
    // Note: This is a placeholder. Actual async loading would require
    // integration with tokio or another async runtime.
    // For now, this function exists to show the intended API.
}

/// Lazy load multiple items
///
/// Loads multiple items in parallel
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `states` - List of lazy load states
/// * `load_fn` - Function to load each item
/// * `render_fn` - Function to render each item
///
/// # Examples
/// ```no_run
/// use rsui::{lazy_load_multiple, context::RsuiContext, widgets::lazy_load::LazyLoadState};
///
/// let mut states = vec![
///     LazyLoadState::new(),
///     LazyLoadState::new(),
///     LazyLoadState::new(),
/// ];
/// lazy_load_multiple(ui, rsui_ctx, &mut states, |index| {
///     Ok(format!("Item {}", index))
/// }, |ui, index, data| {
///     ui.label(data);
/// });
/// ```
pub fn lazy_load_multiple<T, E>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    states: &mut [LazyLoadState<T>],
    load_fn: impl Fn(usize) -> Result<T, E>,
    render_fn: impl Fn(&mut Ui, usize, &T),
) where
    E: std::fmt::Display,
{
    for (index, state) in states.iter_mut().enumerate() {
        ui.vertical(|ui| {
            lazy_load(ui, rsui_ctx, state, || load_fn(index), |ui, data| {
                render_fn(ui, index, data);
            });
        });
    }
}
