use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Breadcrumb item
#[derive(Debug, Clone)]
pub struct BreadcrumbItem {
    pub label: String,
    pub href: Option<String>,
}

impl BreadcrumbItem {
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            href: None,
        }
    }

    pub fn with_href(mut self, href: impl Into<String>) -> Self {
        self.href = Some(href.into());
        self
    }
}

/// Breadcrumb widget
///
/// Displays navigation breadcrumbs with dropdown support
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `items` - List of breadcrumb items
///
/// # Examples
/// ```no_run
/// use rsui::{breadcrumb, context::RsuiContext, components::breadcrumb::BreadcrumbItem};
///
/// let items = vec![
///     BreadcrumbItem::new("Home").with_href("/"),
///     BreadcrumbItem::new("Products").with_href("/products"),
///     BreadcrumbItem::new("Details"),
/// ];
/// breadcrumb(ui, rsui_ctx, &items);
/// ```
pub fn breadcrumb(ui: &mut Ui, rsui_ctx: &RsuiContext, items: &[BreadcrumbItem]) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for (index, item) in items.iter().enumerate() {
            // Render item
            if let Some(href) = &item.href {
                if ui.link(&item.label).clicked() {
                    // Handle navigation
                    println!("Navigate to: {}", href);
                }
            } else {
                ui.label(&item.label);
            }

            // Add separator if not last item
            if index < items.len() - 1 {
                ui.label(egui::RichText::new("/").color(theme.card_foreground));
                ui.add_space(4.0);
            }
        }
    });
}

/// Breadcrumb with dropdown support
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `items` - List of breadcrumb items
/// * `dropdown_items` - Optional dropdown items for each breadcrumb
///
/// # Examples
/// ```no_run
/// use rsui::{breadcrumb_with_dropdown, context::RsuiContext, components::breadcrumb::BreadcrumbItem};
///
/// let items = vec![BreadcrumbItem::new("Home")];
/// let dropdown_items = vec![vec!["Dashboard".to_string(), "Settings".to_string()]];
/// breadcrumb_with_dropdown(ui, rsui_ctx, &items, Some(&dropdown_items));
/// ```
pub fn breadcrumb_with_dropdown(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    items: &[BreadcrumbItem],
    dropdown_items: Option<&[Vec<String>]>,
) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for (index, item) in items.iter().enumerate() {
            // Check if this item has dropdown
            let has_dropdown = dropdown_items
                .and_then(|d| d.get(index))
                .map(|d| !d.is_empty())
                .unwrap_or(false);

            if has_dropdown {
                // Render dropdown button
                if ui.button(&item.label).small().clicked() {
                    // Show dropdown
                    if let Some(items) = dropdown_items.and_then(|d| d.get(index)) {
                        for dropdown_item in items {
                            ui.label(dropdown_item);
                        }
                    }
                }
            } else if let Some(href) = &item.href {
                if ui.link(&item.label).clicked() {
                    println!("Navigate to: {}", href);
                }
            } else {
                ui.label(&item.label);
            }

            if index < items.len() - 1 {
                ui.label(egui::RichText::new("/").color(theme.card_foreground));
                ui.add_space(4.0);
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_breadcrumb_item() {
        let item = BreadcrumbItem::new("Home");
        assert_eq!(item.label, "Home");
        assert!(item.href.is_none());

        let item_with_href = BreadcrumbItem::new("Products").with_href("/products");
        assert_eq!(item_with_href.href, Some("/products".to_string()));
    }
}
