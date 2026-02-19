use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Rating variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RatingVariant {
    Star,
    Emoji,
    Number,
    Custom,
}

/// Rating state
#[derive(Debug, Clone)]
pub struct RatingState {
    pub rating: f32,
    pub max_rating: f32,
    pub variant: RatingVariant,
    pub hover_rating: Option<f32>,
}

impl Default for RatingState {
    fn default() -> Self {
        Self {
            rating: 0.0,
            max_rating: 5.0,
            variant: RatingVariant::Star,
            hover_rating: None,
        }
    }
}

impl RatingState {
    pub fn new(max_rating: f32) -> Self {
        Self {
            rating: 0.0,
            max_rating,
            variant: RatingVariant::Star,
            hover_rating: None,
        }
    }

    pub fn with_variant(mut self, variant: RatingVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn set_rating(&mut self, rating: f32) {
        self.rating = rating.clamp(0.0, self.max_rating);
    }

    pub fn get_rating(&self) -> f32 {
        self.rating
    }

    pub fn set_hover_rating(&mut self, rating: Option<f32>) {
        self.hover_rating = rating;
    }

    pub fn get_display_rating(&self) -> f32 {
        self.hover_rating.unwrap_or(self.rating)
    }

    pub fn is_half(&self) -> bool {
        self.rating % 1.0 != 0.0
    }
}

/// Rating widget
///
/// Star rating, emoji rating, or custom rating
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The rating state
/// * `label` - Optional label for the rating
///
/// # Examples
/// ```no_run
/// use rsui::{rating, context::RsuiContext, components::rating::{RatingState, RatingVariant}};
///
/// let mut state = RatingState::new(5.0).with_variant(RatingVariant::Star);
/// rating(ui, rsui_ctx, &mut state, Some("Rate this"));
/// ```
pub fn rating(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut RatingState,
    label: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        // Label
        if let Some(l) = label {
            ui.label(egui::RichText::new(l).size(14.0).color(theme.foreground));
            ui.add_space(8.0);
        }

        // Rating display
        ui.horizontal(|ui| {
            for i in 1..=state.max_rating as i32 {
                let current = i as f32;
                let display = state.get_display_rating();
                let is_filled = current <= display;
                let is_half = !is_filled && (current - 0.5) <= display;

                let response = match state.variant {
                    RatingVariant::Star => {
                        let icon = if is_half {
                            "★".to_string()
                        } else if is_filled {
                            "★".to_string()
                        } else {
                            "☆".to_string()
                        };
                        ui.button(icon).small()
                    }
                    RatingVariant::Emoji => {
                        let emoji = if is_filled {
                            "😀"
                        } else {
                            "😐"
                        };
                        ui.button(emoji).small()
                    }
                    RatingVariant::Number => {
                        let text = if is_filled {
                            format!("{}", current)
                        } else {
                            "○".to_string()
                        };
                        ui.button(text).small()
                    }
                    RatingVariant::Custom => {
                        ui.button(if is_filled { "●" } else { "○" }).small()
                    }
                };

                if response.hovered() {
                    state.set_hover_rating(Some(current as f32));
                }

                if response.clicked() {
                    state.set_rating(current as f32);
                    state.set_hover_rating(None);
                }
            }

            // Rating value display
            ui.add_space(8.0);
            ui.label(format!("{:.1}", state.rating));
        });

        // Reset hover when mouse leaves
        if !ui.rect_contains_pointer(ui.cursor()) {
            state.set_hover_rating(None);
        }
    });
}

/// Star rating widget
///
/// Simple star rating
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The rating state
///
/// # Examples
/// ```no_run
/// use rsui::{star_rating, context::RsuiContext, components::rating::RatingState};
///
/// let mut state = RatingState::new(5.0);
/// star_rating(ui, rsui_ctx, &mut state);
/// ```
pub fn star_rating(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut RatingState) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for i in 1..=state.max_rating as i32 {
            let current = i as f32;
            let display = state.get_display_rating();
            let is_filled = current <= display;
            let is_half = !is_filled && (current - 0.5) <= display;

            let icon = if is_half {
                "★".to_string()
            } else if is_filled {
                "★".to_string()
            } else {
                "☆".to_string()
            };

            let response = ui.button(icon).small();

            if response.hovered() {
                state.set_hover_rating(Some(current as f32));
            }

            if response.clicked() {
                state.set_rating(current as f32);
                state.set_hover_rating(None);
            }
        }
    });

    // Reset hover when mouse leaves
    if !ui.rect_contains_pointer(ui.cursor()) {
        state.set_hover_rating(None);
    }
}

/// Emoji rating widget
///
/// Emoji-based rating
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The rating state
///
/// # Examples
/// ```no_run
/// use rsui::{emoji_rating, context::RsuiContext, components::rating::{RatingState, RatingVariant}};
///
/// let mut state = RatingState::new(5.0).with_variant(RatingVariant::Emoji);
/// emoji_rating(ui, rsui_ctx, &mut state);
/// ```
pub fn emoji_rating(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut RatingState) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for i in 1..=state.max_rating as i32 {
            let current = i as f32;
            let display = state.get_display_rating();
            let is_filled = current <= display;

            let emoji = if is_filled {
                "😀"
            } else {
                "😐"
            };

            let response = ui.button(emoji).small();

            if response.hovered() {
                state.set_hover_rating(Some(current as f32));
            }

            if response.clicked() {
                state.set_rating(current as f32);
                state.set_hover_rating(None);
            }
        }
    });

    // Reset hover when mouse leaves
    if !ui.rect_contains_pointer(ui.cursor()) {
        state.set_hover_rating(None);
    }
}

/// Number rating widget
///
/// Number-based rating (1, 2, 3, 4, 5)
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The rating state
///
/// # Examples
/// ```no_run
/// use rsui::{number_rating, context::RsuiContext, components::rating::{RatingState, RatingVariant}};
///
/// let mut state = RatingState::new(5.0).with_variant(RatingVariant::Number);
/// number_rating(ui, rsui_ctx, &mut state);
/// ```
pub fn number_rating(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut RatingState) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for i in 1..=state.max_rating as i32 {
            let current = i as f32;
            let display = state.get_display_rating();
            let is_filled = current <= display;

            let text = if is_filled {
                format!("{}", current)
            } else {
                "○".to_string()
            };

            let response = ui.button(text).small();

            if response.hovered() {
                state.set_hover_rating(Some(current as f32));
            }

            if response.clicked() {
                state.set_rating(current as f32);
                state.set_hover_rating(None);
            }
        }
    });

    // Reset hover when mouse leaves
    if !ui.rect_contains_pointer(ui.cursor()) {
        state.set_hover_rating(None);
    }
}

/// Read-only rating display
///
/// Display rating without interaction
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `rating` - The rating value
/// * `max_rating` - Maximum rating
/// * `variant` - Rating variant
///
/// # Examples
/// ```no_run
/// use rsui::{rating_display, context::RsuiContext, components::rating::RatingVariant};
///
/// rating_display(ui, rsui_ctx, 4.5, 5.0, RatingVariant::Star);
/// ```
pub fn rating_display(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    rating: f32,
    max_rating: f32,
    variant: RatingVariant,
) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for i in 1..=max_rating as i32 {
            let current = i as f32;
            let is_filled = current <= rating;
            let is_half = !is_filled && (current - 0.5) <= rating;

            match variant {
                RatingVariant::Star => {
                    let icon = if is_half {
                        "★".to_string()
                    } else if is_filled {
                        "★".to_string()
                    } else {
                        "☆".to_string()
                    };
                    ui.label(egui::RichText::new(icon).color(theme.primary));
                }
                RatingVariant::Emoji => {
                    let emoji = if is_filled {
                        "😀"
                    } else {
                        "😐"
                    };
                    ui.label(emoji);
                }
                RatingVariant::Number => {
                    let text = if is_filled {
                        format!("{}", current)
                    } else {
                        "○".to_string()
                    };
                    ui.label(text);
                }
                RatingVariant::Custom => {
                    ui.label(if is_filled { "●" } else { "○" });
                }
            }
        }

        ui.add_space(4.0);
        ui.label(format!("{:.1}", rating));
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rating_state() {
        let mut state = RatingState::new(5.0);
        
        assert_eq!(state.get_rating(), 0.0);
        assert_eq!(state.max_rating, 5.0);
        
        state.set_rating(3.5);
        assert_eq!(state.get_rating(), 3.5);
        assert!(state.is_half());
        
        state.set_rating(4.0);
        assert!(!state.is_half());
    }

    #[test]
    fn test_rating_variant() {
        assert_eq!(RatingVariant::Star, RatingVariant::Star);
        assert_eq!(RatingVariant::Emoji, RatingVariant::Emoji);
        assert_eq!(RatingVariant::Number, RatingVariant::Number);
    }

    #[test]
    fn test_rating_state_with_variant() {
        let state = RatingState::new(5.0).with_variant(RatingVariant::Emoji);
        assert_eq!(state.variant, RatingVariant::Emoji);
    }

    #[test]
    fn test_get_display_rating() {
        let mut state = RatingState::new(5.0);
        
        assert_eq!(state.get_display_rating(), 0.0);
        
        state.set_hover_rating(Some(3.0));
        assert_eq!(state.get_display_rating(), 3.0);
        
        state.set_hover_rating(None);
        assert_eq!(state.get_display_rating(), 0.0);
    }
}
