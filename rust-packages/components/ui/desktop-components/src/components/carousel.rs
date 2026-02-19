use crate::context::RsuiContext;
use eframe::egui::{self, Ui, Vec2};

/// Carousel state
#[derive(Debug, Clone)]
pub struct CarouselState {
    pub current_index: usize,
    pub items_count: usize,
    pub autoplay: bool,
    pub autoplay_interval_ms: u64,
    pub show_navigation: bool,
    pub show_indicators: bool,
}

impl Default for CarouselState {
    fn default() -> Self {
        Self {
            current_index: 0,
            items_count: 0,
            autoplay: false,
            autoplay_interval_ms: 5000,
            show_navigation: true,
            show_indicators: true,
        }
    }
}

impl CarouselState {
    pub fn new(items_count: usize) -> Self {
        Self {
            items_count,
            ..Default::default()
        }
    }

    pub fn with_autoplay(mut self, enabled: bool) -> Self {
        self.autoplay = enabled;
        self
    }

    pub fn with_interval(mut self, interval_ms: u64) -> Self {
        self.autoplay_interval_ms = interval_ms;
        self
    }

    pub fn with_navigation(mut self, show: bool) -> Self {
        self.show_navigation = show;
        self
    }

    pub fn with_indicators(mut self, show: bool) -> Self {
        self.show_indicators = show;
        self
    }

    pub fn next(&mut self) {
        if self.items_count > 0 {
            self.current_index = (self.current_index + 1) % self.items_count;
        }
    }

    pub fn previous(&mut self) {
        if self.items_count > 0 {
            self.current_index = if self.current_index == 0 {
                self.items_count - 1
            } else {
                self.current_index - 1
            };
        }
    }

    pub fn go_to(&mut self, index: usize) {
        if index < self.items_count {
            self.current_index = index;
        }
    }

    pub fn is_first(&self) -> bool {
        self.current_index == 0
    }

    pub fn is_last(&self) -> bool {
        self.items_count > 0 && self.current_index == self.items_count - 1
    }
}

/// Carousel widget
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The carousel state
/// * `content` - Function to render each item
///
/// # Examples
/// ```no_run
/// use rsui::{carousel, context::RsuiContext, components::carousel::CarouselState};
///
/// let mut state = CarouselState::new(5)
///     .with_autoplay(true)
///     .with_navigation(true);
/// carousel(ui, rsui_ctx, &mut state, |ui, index| {
///     ui.label(format!("Item {}", index));
/// });
/// ```
pub fn carousel(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut CarouselState,
    content: impl FnOnce(&mut Ui, usize),
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(16.0, 16.0))
        .show(ui, |ui| {
            ui.set_min_size(Vec2::new(400.0, 300.0));

            // Navigation buttons
            if state.show_navigation && state.items_count > 1 {
                ui.horizontal(|ui| {
                    // Previous button
                    if ui
                        .button("←")
                        .enabled(!state.is_first())
                        .clicked()
                    {
                        state.previous();
                    }

                    ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                        // Next button
                        if ui
                            .button("→")
                            .enabled(!state.is_last())
                            .clicked()
                        {
                            state.next();
                        }
                    });
                });

                ui.add_space(8.0);
            }

            // Content area
            egui::ScrollArea::vertical()
                .show(ui, |ui| {
                    content(ui, state.current_index);
                });

            ui.add_space(16.0);

            // Indicators
            if state.show_indicators && state.items_count > 1 {
                ui.horizontal_centered(|ui| {
                    for i in 0..state.items_count {
                        let is_active = i == state.current_index;
                        let response = ui.add(
                            egui::Button::new("●")
                                .small()
                                .fill(if is_active {
                                    theme.primary
                                } else {
                                    theme.border
                                })
                        );

                        if response.clicked() {
                            state.go_to(i);
                        }
                    }
                });
            }
        });
}

/// Simple image carousel
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The carousel state
/// * `images` - List of image URLs or paths
///
/// # Examples
/// ```no_run
/// use rsui::{image_carousel, context::RsuiContext, components::carousel::CarouselState};
///
/// let mut state = CarouselState::new(3);
/// let images = vec!["image1.jpg", "image2.jpg", "image3.jpg"];
/// image_carousel(ui, rsui_ctx, &mut state, &images);
/// ```
pub fn image_carousel(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut CarouselState,
    images: &[String],
) {
    carousel(ui, rsui_ctx, state, |ui, index| {
        if let Some(image_url) = images.get(index) {
            ui.vertical_centered(|ui| {
                ui.label(egui::RichText::new(image_url).size(14.0));
                // Note: Actual image loading would require egui_extras::RetainedImage
                // This is a placeholder for future implementation
                ui.label(egui::RichText::new("🖼️").size(128.0));
            });
        }
    });
}

/// Card carousel for displaying cards in a carousel
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The carousel state
/// * `cards` - List of card content
///
/// # Examples
/// ```no_run
/// use rsui::{card_carousel, context::RsuiContext, components::carousel::CarouselState};
///
/// let mut state = CarouselState::new(3);
/// let cards = vec!["Card 1", "Card 2", "Card 3"];
/// card_carousel(ui, rsui_ctx, &mut state, &cards, |ui, content| {
///     ui.label(content);
/// });
/// ```
pub fn card_carousel<T>(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut CarouselState,
    cards: &[T],
    render_card: impl Fn(&mut Ui, &T),
) {
    carousel(ui, rsui_ctx, state, |ui, index| {
        if let Some(card) = cards.get(index) {
            render_card(ui, card);
        }
    });
}

/// Thumbnail carousel with preview
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The carousel state
/// * `thumbnails` - List of thumbnail URLs
/// * `render_preview` - Function to render the preview
///
/// # Examples
/// ```no_run
/// use rsui::{thumbnail_carousel, context::RsuiContext, components::carousel::CarouselState};
///
/// let mut state = CarouselState::new(5);
/// let thumbnails = vec!["thumb1.jpg", "thumb2.jpg", "thumb3.jpg", "thumb4.jpg", "thumb5.jpg"];
/// thumbnail_carousel(ui, rsui_ctx, &mut state, &thumbnails, |ui, index| {
///     ui.label(format!("Preview {}", index));
/// });
/// ```
pub fn thumbnail_carousel(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut CarouselState,
    thumbnails: &[String],
    render_preview: impl Fn(&mut Ui, usize),
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(16.0, 16.0))
        .show(ui, |ui| {
            // Preview area
            ui.set_min_height(300.0);
            render_preview(ui, state.current_index);

            ui.add_space(16.0);

            // Thumbnail strip
            ui.horizontal(|ui| {
                for (index, thumb) in thumbnails.iter().enumerate() {
                    let is_active = index == state.current_index;
                    let response = ui.add(
                        egui::Button::new(
                            egui::RichText::new(thumb).size(10.0)
                        )
                        .fill(if is_active {
                            theme.primary
                        } else {
                            theme.input
                        })
                        .stroke(if is_active {
                            egui::Stroke::new(2.0, theme.primary)
                        } else {
                            egui::Stroke::new(1.0, theme.border)
                        })
                        .rounding(4.0)
                    );

                    if response.clicked() {
                        state.go_to(index);
                    }
                }
            });
        });
}
