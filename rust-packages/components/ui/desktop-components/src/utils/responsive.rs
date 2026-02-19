use crate::constants::breakpoints::{ScreenSize, BREAKPOINT_LG, BREAKPOINT_MD, BREAKPOINT_SM, BREAKPOINT_XL, BREAKPOINT_XL2};
use eframe::egui::{self, Ui};

/// Check if current screen size matches a breakpoint
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_size` - The screen size to check
///
/// # Returns
/// * `bool` - Whether the current screen matches the breakpoint
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{is_screen_size, ScreenSize};
/// use eframe::egui::Ui;
///
/// if is_screen_size(ui, ScreenSize::MD) {
///     println!("Medium screen");
/// }
/// ```
pub fn is_screen_size(ui: &Ui, screen_size: ScreenSize) -> bool {
    let available_width = ui.available_width();
    let current_size = ScreenSize::from_width(available_width);
    current_size == screen_size
}

/// Check if current screen is at least a certain size
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_size` - The minimum screen size
///
/// # Returns
/// * `bool` - Whether the current screen is at least the specified size
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{is_at_least, ScreenSize};
/// use eframe::egui::Ui;
///
/// if is_at_least(ui, ScreenSize::LG) {
///     println("Large screen or larger");
/// }
/// ```
pub fn is_at_least(ui: &Ui, screen_size: ScreenSize) -> bool {
    let available_width = ui.available_width();
    screen_size.is_at_least(available_width)
}

/// Check if current screen is smaller than a certain size
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_size` - The maximum screen size
///
/// # Returns
/// * `bool` - Whether the current screen is smaller than the specified size
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{is_smaller_than, ScreenSize};
/// use eframe::egui::Ui;
///
/// if is_smaller_than(ui, ScreenSize::MD) {
///     println("Small screen");
/// }
/// ```
pub fn is_smaller_than(ui: &Ui, screen_size: ScreenSize) -> bool {
    let available_width = ui.available_width();
    screen_size.is_smaller_than(available_width)
}

/// Get current screen size
///
/// # Arguments
/// * `ui` - The UI context
///
/// # Returns
/// * `ScreenSize` - The current screen size
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{get_screen_size, ScreenSize};
/// use eframe::egui::Ui;
///
/// let size = get_screen_size(ui);
/// match size {
///     ScreenSize::SM => println("Small screen"),
///     ScreenSize::MD => println("Medium screen"),
///     ScreenSize::LG => println("Large screen"),
///     _ => println("Other screen"),
/// }
/// ```
pub fn get_screen_size(ui: &Ui) -> ScreenSize {
    let available_width = ui.available_width();
    ScreenSize::from_width(available_width)
}

/// Conditional rendering based on screen size
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_size` - The screen size to match
/// * `content` - The content to render if condition is met
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{show_on, ScreenSize};
/// use eframe::egui::Ui;
///
/// show_on(ui, ScreenSize::LG, |ui| {
///     ui.label("This only shows on large screens");
/// });
/// ```
pub fn show_on(ui: &mut Ui, screen_size: ScreenSize, content: impl FnOnce(&mut Ui)) {
    if is_screen_size(ui, screen_size) {
        content(ui);
    }
}

/// Conditional rendering for screens at least a certain size
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_size` - The minimum screen size
/// * `content` - The content to render if condition is met
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{show_at_least, ScreenSize};
/// use eframe::egui::Ui;
///
/// show_at_least(ui, ScreenSize::MD, |ui| {
///     ui.label("This shows on medium screens and larger");
/// });
/// ```
pub fn show_at_least(ui: &mut Ui, screen_size: ScreenSize, content: impl FnOnce(&mut Ui)) {
    if is_at_least(ui, screen_size) {
        content(ui);
    }
}

/// Conditional rendering for screens smaller than a certain size
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_size` - The maximum screen size
/// * `content` - The content to render if condition is met
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{show_smaller_than, ScreenSize};
/// use eframe::egui::Ui;
///
/// show_smaller_than(ui, ScreenSize::MD, |ui| {
///     ui.label("This shows on small screens");
/// });
/// ```
pub fn show_smaller_than(ui: &mut Ui, screen_size: ScreenSize, content: impl FnOnce(&mut Ui)) {
    if is_smaller_than(ui, screen_size) {
        content(ui);
    }
}

/// Responsive spacing based on screen size
///
/// # Arguments
/// * `ui` - The UI context
/// * `mobile` - Spacing for mobile screens
/// * `tablet` - Spacing for tablet screens
/// * `desktop` - Spacing for desktop screens
///
/// # Returns
/// * `f32` - The appropriate spacing value
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::responsive_spacing;
/// use eframe::egui::Ui;
///
/// let spacing = responsive_spacing(ui, 8.0, 16.0, 24.0);
/// ui.add_space(spacing);
/// ```
pub fn responsive_spacing(ui: &Ui, mobile: f32, tablet: f32, desktop: f32) -> f32 {
    let screen_size = get_screen_size(ui);
    match screen_size {
        ScreenSize::XS | ScreenSize::SM => mobile,
        ScreenSize::MD => tablet,
        ScreenSize::LG | ScreenSize::XL | ScreenSize::XL2 => desktop,
    }
}

/// Responsive column count based on screen size
///
/// # Arguments
/// * `ui` - The UI context
/// * `mobile` - Column count for mobile screens
/// * `tablet` - Column count for tablet screens
/// * `desktop` - Column count for desktop screens
///
/// # Returns
/// * `usize` - The appropriate column count
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::responsive_columns;
/// use eframe::egui::Ui;
///
/// let columns = responsive_columns(ui, 1, 2, 3);
/// ```
pub fn responsive_columns(ui: &Ui, mobile: usize, tablet: usize, desktop: usize) -> usize {
    let screen_size = get_screen_size(ui);
    match screen_size {
        ScreenSize::XS | ScreenSize::SM => mobile,
        ScreenSize::MD => tablet,
        ScreenSize::LG | ScreenSize::XL | ScreenSize::XL2 => desktop,
    }
}

/// Responsive font size based on screen size
///
/// # Arguments
/// * `ui` - The UI context
/// * `mobile` - Font size for mobile screens
/// * `tablet` - Font size for tablet screens
/// * `desktop` - Font size for desktop screens
///
/// # Returns
/// * `f32` - The appropriate font size
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::responsive_font_size;
/// use eframe::egui::Ui;
///
/// let font_size = responsive_font_size(ui, 14.0, 16.0, 18.0);
/// ui.label(egui::RichText::new("Responsive text").size(font_size));
/// ```
pub fn responsive_font_size(ui: &Ui, mobile: f32, tablet: f32, desktop: f32) -> f32 {
    let screen_size = get_screen_size(ui);
    match screen_size {
        ScreenSize::XS | ScreenSize::SM => mobile,
        ScreenSize::MD => tablet,
        ScreenSize::LG | ScreenSize::XL | ScreenSize::XL2 => desktop,
    }
}

/// Hide content on specific screen sizes
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_sizes` - List of screen sizes to hide on
/// * `content` - The content to conditionally render
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{hide_on, ScreenSize};
/// use eframe::egui::Ui;
///
/// hide_on(ui, vec![ScreenSize::XS, ScreenSize::SM], |ui| {
///     ui.label("This is hidden on small screens");
/// });
/// ```
pub fn hide_on(ui: &mut Ui, screen_sizes: Vec<ScreenSize>, content: impl FnOnce(&mut Ui)) {
    let current_size = get_screen_size(ui);
    if !screen_sizes.contains(&current_size) {
        content(ui);
    }
}

/// Show content only on specific screen sizes
///
/// # Arguments
/// * `ui` - The UI context
/// * `screen_sizes` - List of screen sizes to show on
/// * `content` - The content to conditionally render
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{show_only_on, ScreenSize};
/// use eframe::egui::Ui;
///
/// show_only_on(ui, vec![ScreenSize::LG, ScreenSize::XL], |ui| {
///     ui.label("This only shows on large screens");
/// });
/// ```
pub fn show_only_on(ui: &mut Ui, screen_sizes: Vec<ScreenSize>, content: impl FnOnce(&mut Ui)) {
    let current_size = get_screen_size(ui);
    if screen_sizes.contains(&current_size) {
        content(ui);
    }
}

/// Responsive layout helper
///
/// Automatically switches between horizontal and vertical layout based on screen size
///
/// # Arguments
/// * `ui` - The UI context
/// * `breakpoint` - The breakpoint at which to switch layouts
/// * `horizontal_content` - Content for horizontal layout
/// * `vertical_content` - Content for vertical layout
///
/// # Examples
/// ```no_run
/// use rsui::utils::responsive::{responsive_layout, ScreenSize};
/// use eframe::egui::Ui;
///
/// responsive_layout(ui, ScreenSize::MD, |ui| {
///     ui.label("Horizontal layout");
/// }, |ui| {
///     ui.label("Vertical layout");
/// });
/// ```
pub fn responsive_layout(
    ui: &mut Ui,
    breakpoint: ScreenSize,
    horizontal_content: impl FnOnce(&mut Ui),
    vertical_content: impl FnOnce(&mut Ui),
) {
    if is_at_least(ui, breakpoint) {
        ui.horizontal(|ui| {
            horizontal_content(ui);
        });
    } else {
        ui.vertical(|ui| {
            vertical_content(ui);
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_screen_size_from_width() {
        assert_eq!(ScreenSize::from_width(500.0), ScreenSize::SM);
        assert_eq!(ScreenSize::from_width(700.0), ScreenSize::MD);
        assert_eq!(ScreenSize::from_width(1100.0), ScreenSize::LG);
        assert_eq!(ScreenSize::from_width(1300.0), ScreenSize::XL);
        assert_eq!(ScreenSize::from_width(1600.0), ScreenSize::XL2);
    }

    #[test]
    fn test_screen_size_is_at_least() {
        assert!(ScreenSize::MD.is_at_least(700.0));
        assert!(!ScreenSize::MD.is_at_least(600.0));
    }

    #[test]
    fn test_screen_size_is_smaller_than() {
        assert!(ScreenSize::MD.is_smaller_than(600.0));
        assert!(!ScreenSize::MD.is_smaller_than(700.0));
    }

    #[test]
    fn test_responsive_columns() {
        // Mock UI for testing
        // Note: Actual testing would require egui context
        assert_eq!(responsive_columns(&mock_ui(500.0), 1, 2, 3), 1);
        assert_eq!(responsive_columns(&mock_ui(700.0), 1, 2, 3), 2);
        assert_eq!(responsive_columns(&mock_ui(1100.0), 1, 2, 3), 3);
    }

    fn mock_ui(width: f32) -> Ui {
        // This is a placeholder - actual testing would require egui context
        panic!("Mock UI not implemented for testing")
    }
}
