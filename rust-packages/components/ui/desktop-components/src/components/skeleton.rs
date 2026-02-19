use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Skeleton variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SkeletonVariant {
    Text,
    Circle,
    Rect,
}

/// Simple skeleton widget (legacy)
pub fn skeleton(ui: &mut egui::Ui, size: egui::Vec2) -> egui::Response {
    let (rect, response) = ui.allocate_exact_size(size, egui::Sense::hover());
    let visuals = ui.style().visuals.widgets.inactive;
    ui.painter()
        .rect_filled(rect, visuals.corner_radius, visuals.bg_fill);
    response
}

/// Skeleton widget with theme support
///
/// Placeholder content while loading
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `variant` - The skeleton variant
/// * `width` - The width of the skeleton
/// * `height` - The height of the skeleton
///
/// # Examples
/// ```no_run
/// use rsui::{skeleton_with_theme, context::RsuiContext, components::skeleton::SkeletonVariant};
///
/// skeleton_with_theme(ui, rsui_ctx, SkeletonVariant::Text, 200.0, 20.0);
/// ```
pub fn skeleton_with_theme(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    variant: SkeletonVariant,
    width: f32,
    height: f32,
) {
    let theme = &rsui_ctx.theme;

    let painter = ui.painter();
    let rect = ui.allocate_space(egui::Vec2::new(width, height)).1;

    let fill_color = lighten(theme.input, 0.1);
    let stroke_color = lighten(theme.border, 0.1);

    match variant {
        SkeletonVariant::Rect => {
            painter.rect(
                rect,
                theme.radius,
                fill_color,
                egui::Stroke::new(1.0, stroke_color),
            );
        }
        SkeletonVariant::Circle => {
            painter.circle(
                rect.center(),
                rect.width().min(rect.height()) / 2.0,
                fill_color,
                egui::Stroke::new(1.0, stroke_color),
            );
        }
        SkeletonVariant::Text => {
            painter.rect(
                rect,
                4.0,
                fill_color,
                egui::Stroke::new(1.0, stroke_color),
            );
        }
    }
}

/// Animated skeleton widget
///
/// Skeleton with shimmer animation effect
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `variant` - The skeleton variant
/// * `width` - The width of the skeleton
/// * `height` - The height of the skeleton
///
/// # Examples
/// ```no_run
/// use rsui::{skeleton_animated, context::RsuiContext, components::skeleton::SkeletonVariant};
///
/// skeleton_animated(ui, rsui_ctx, SkeletonVariant::Rect, 200.0, 100.0);
/// ```
pub fn skeleton_animated(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    variant: SkeletonVariant,
    width: f32,
    height: f32,
) {
    let theme = &rsui_ctx.theme;
    let time = ui.input(|i| i.time);

    let painter = ui.painter();
    let rect = ui.allocate_space(egui::Vec2::new(width, height)).1;

    // Shimmer effect
    let shimmer_pos = (time.sin() * 0.5 + 0.5) * rect.width();
    let shimmer_width = 100.0;
    let shimmer_rect = egui::Rect::from_min_max(
        egui::pos2(rect.left() + shimmer_pos - shimmer_width / 2.0, rect.top()),
        egui::pos2(rect.left() + shimmer_pos + shimmer_width / 2.0, rect.bottom()),
    );

    let base_color = lighten(theme.input, 0.1);
    let shimmer_color = lighten(theme.input, 0.3);

    match variant {
        SkeletonVariant::Rect => {
            painter.rect(
                rect,
                theme.radius,
                base_color,
                egui::Stroke::new(1.0, theme.border),
            );
            painter.rect(
                shimmer_rect.intersect(rect),
                theme.radius,
                shimmer_color,
                egui::Stroke::NONE,
            );
        }
        SkeletonVariant::Circle => {
            painter.circle(
                rect.center(),
                rect.width().min(rect.height()) / 2.0,
                base_color,
                egui::Stroke::new(1.0, theme.border),
            );
        }
        SkeletonVariant::Text => {
            painter.rect(
                rect,
                4.0,
                base_color,
                egui::Stroke::new(1.0, theme.border),
            );
            painter.rect(
                shimmer_rect.intersect(rect),
                4.0,
                shimmer_color,
                egui::Stroke::NONE,
            );
        }
    }
}

/// Skeleton text widget
///
/// Placeholder for text content with multiple lines
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `lines` - Number of lines
/// * `width` - Width of each line
///
/// # Examples
/// ```no_run
/// use rsui::{skeleton_text, context::RsuiContext};
///
/// skeleton_text(ui, rsui_ctx, 3, 200.0);
/// ```
pub fn skeleton_text(ui: &mut Ui, rsui_ctx: &RsuiContext, lines: usize, width: f32) {
    let line_height = 16.0;
    let line_spacing = 8.0;

    for i in 0..lines {
        let line_width = if i == lines - 1 {
            width * 0.6 // Last line is shorter
        } else {
            width
        };

        skeleton_with_theme(
            ui,
            rsui_ctx,
            SkeletonVariant::Text,
            line_width,
            line_height,
        );

        if i < lines - 1 {
            ui.add_space(line_spacing);
        }
    }
}

/// Skeleton avatar widget
///
/// Placeholder for avatar images
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `size` - Size of the avatar
///
/// # Examples
/// ```no_run
/// use rsui::{skeleton_avatar, context::RsuiContext};
///
/// skeleton_avatar(ui, rsui_ctx, 40.0);
/// ```
pub fn skeleton_avatar(ui: &mut Ui, rsui_ctx: &RsuiContext, size: f32) {
    skeleton_with_theme(ui, rsui_ctx, SkeletonVariant::Circle, size, size);
}

/// Skeleton card widget
///
/// Placeholder for card content
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `width` - Width of the card
/// * `height` - Height of the card
///
/// # Examples
/// ```no_run
/// use rsui::{skeleton_card, context::RsuiContext};
///
/// skeleton_card(ui, rsui_ctx, 300.0, 200.0);
/// ```
pub fn skeleton_card(ui: &mut Ui, rsui_ctx: &RsuiContext, width: f32, height: f32) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(16.0, 16.0))
        .show(ui, |ui| {
            // Avatar
            skeleton_avatar(ui, rsui_ctx, 40.0);
            ui.add_space(12.0);

            // Text lines
            skeleton_text(ui, rsui_ctx, 3, width - 32.0);
        });
}

// Helper function to lighten color
fn lighten(color: eframe::egui::Color32, factor: f32) -> eframe::egui::Color32 {
    let [r, g, b, a] = color.to_array();
    let factor = factor.clamp(0.0, 1.0);
    
    eframe::egui::Color32::from_rgba_premultiplied(
        ((r as f32) + (255.0 - r as f32) * factor) as u8,
        ((g as f32) + (255.0 - g as f32) * factor) as u8,
        ((b as f32) + (255.0 - b as f32) * factor) as u8,
        a,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_skeleton_variant() {
        assert_eq!(SkeletonVariant::Text, SkeletonVariant::Text);
        assert_eq!(SkeletonVariant::Circle, SkeletonVariant::Circle);
        assert_eq!(SkeletonVariant::Rect, SkeletonVariant::Rect);
    }
}
