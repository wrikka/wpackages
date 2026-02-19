use crate::context::RsuiContext;
use eframe::egui::{self, Ui, Color32, Vec2};

/// Color picker state
#[derive(Debug, Clone)]
pub struct ColorPickerState {
    pub color: Color32,
    pub show_picker: bool,
    pub hue: f32,
    pub saturation: f32,
    pub value: f32,
}

impl Default for ColorPickerState {
    fn default() -> Self {
        Self {
            color: Color32::from_rgb(59, 130, 246),
            show_picker: false,
            hue: 217.0,
            saturation: 0.91,
            value: 0.96,
        }
    }
}

impl ColorPickerState {
    pub fn new(color: Color32) -> Self {
        let [r, g, b, _] = color.to_array();
        let (hue, saturation, value) = rgb_to_hsv(r, g, b);
        
        Self {
            color,
            show_picker: false,
            hue,
            saturation,
            value,
        }
    }

    pub fn update_from_hsv(&mut self) {
        let (r, g, b) = hsv_to_rgb(self.hue, self.saturation, self.value);
        self.color = Color32::from_rgb(r, g, b);
    }

    pub fn update_from_rgb(&mut self, color: Color32) {
        self.color = color;
        let [r, g, b, _] = color.to_array();
        let (hue, saturation, value) = rgb_to_hsv(r, g, b);
        self.hue = hue;
        self.saturation = saturation;
        self.value = value;
    }
}

fn rgb_to_hsv(r: u8, g: u8, b: u8) -> (f32, f32, f32) {
    let r_norm = r as f32 / 255.0;
    let g_norm = g as f32 / 255.0;
    let b_norm = b as f32 / 255.0;

    let max = r_norm.max(g_norm).max(b_norm);
    let min = r_norm.min(g_norm).min(b_norm);
    let delta = max - min;

    let hue = if delta == 0.0 {
        0.0
    } else if max == r_norm {
        60.0 * (((g_norm - b_norm) / delta) % 6.0)
    } else if max == g_norm {
        60.0 * (((b_norm - r_norm) / delta) + 2.0)
    } else {
        60.0 * (((r_norm - g_norm) / delta) + 4.0)
    };

    let saturation = if max == 0.0 { 0.0 } else { delta / max };
    let value = max;

    (hue, saturation, value)
}

fn hsv_to_rgb(hue: f32, saturation: f32, value: f32) -> (u8, u8, u8) {
    let c = value * saturation;
    let x = c * (1.0 - ((hue / 60.0) % 2.0 - 1.0).abs());
    let m = value - c;

    let (r_norm, g_norm, b_norm) = if hue < 60.0 {
        (c, x, 0.0)
    } else if hue < 120.0 {
        (x, c, 0.0)
    } else if hue < 180.0 {
        (0.0, c, x)
    } else if hue < 240.0 {
        (0.0, x, c)
    } else if hue < 300.0 {
        (x, 0.0, c)
    } else {
        (c, 0.0, x)
    };

    let r = ((r_norm + m) * 255.0) as u8;
    let g = ((g_norm + m) * 255.0) as u8;
    let b = ((b_norm + m) * 255.0) as u8;

    (r, g, b)
}

/// Color picker widget
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The color picker state
/// * `label` - Optional label for the color picker
///
/// # Examples
/// ```no_run
/// use rsui::{color_picker, context::RsuiContext, components::color_picker::ColorPickerState};
/// use eframe::egui::Color32;
///
/// let mut state = ColorPickerState::new(Color32::from_rgb(255, 0, 0));
/// color_picker(ui, rsui_ctx, &mut state, Some("Select Color"));
/// ```
pub fn color_picker(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ColorPickerState,
    label: Option<&str>,
) {
    let id = egui::Id::new("color_picker").with(state.color);
    
    ui.horizontal(|ui| {
        if let Some(lbl) = label {
            ui.label(lbl);
        }

        // Color preview button
        let response = ui.add(
            egui::Button::new(
                egui::RichText::new("  ").size(24.0)
            )
            .fill(state.color)
            .stroke(egui::Stroke::new(2.0, rsui_ctx.theme.border))
            .rounding(4.0)
        );

        if response.clicked() {
            state.show_picker = !state.show_picker;
        }

        // Hex color display
        let [r, g, b, _] = state.color.to_array();
        ui.label(format!("#{:02X}{:02X}{:02X}", r, g, b));
    });

    if state.show_picker {
        egui::Area::new(id)
            .anchor(egui::Align2::LEFT_TOP, ui.cursor_left_top() + Vec2::new(0.0, 5.0))
            .show(ui.ctx(), |ui| {
                color_picker_view(ui, rsui_ctx, state);
            });
    }
}

/// Color picker view
fn color_picker_view(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut ColorPickerState) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(16.0, 16.0))
        .show(ui, |ui| {
            ui.set_min_size(Vec2::new(250.0, 300.0));

            // Hue slider
            ui.label("Hue:");
            let hue_response = ui.add(
                egui::Slider::new(&mut state.hue, 0.0..=360.0)
                    .show_value(false)
            );
            if hue_response.changed() {
                state.update_from_hsv();
            }

            // Saturation slider
            ui.label("Saturation:");
            let sat_response = ui.add(
                egui::Slider::new(&mut state.saturation, 0.0..=1.0)
                    .show_value(false)
            );
            if sat_response.changed() {
                state.update_from_hsv();
            }

            // Value slider
            ui.label("Value:");
            let val_response = ui.add(
                egui::Slider::new(&mut state.value, 0.0..=1.0)
                    .show_value(false)
            );
            if val_response.changed() {
                state.update_from_hsv();
            }

            ui.separator();

            // Preset colors
            ui.label("Presets:");
            ui.horizontal_wrapped(|ui| {
                let presets = vec![
                    Color32::from_rgb(239, 68, 68),
                    Color32::from_rgb(249, 115, 22),
                    Color32::from_rgb(234, 179, 8),
                    Color32::from_rgb(34, 197, 94),
                    Color32::from_rgb(59, 130, 246),
                    Color32::from_rgb(139, 92, 246),
                    Color32::from_rgb(236, 72, 153),
                    Color32::BLACK,
                    Color32::WHITE,
                ];

                for preset in presets {
                    let response = ui.add(
                        egui::Button::new("  ")
                            .fill(preset)
                            .stroke(egui::Stroke::new(1.0, theme.border))
                            .rounding(4.0)
                    );
                    
                    if response.clicked() {
                        state.update_from_rgb(preset);
                    }
                }
            });

            ui.separator();

            // Done button
            if ui.button("Done").clicked() {
                state.show_picker = false;
            }
        });
}

/// Simple color swatch selector
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `colors` - List of colors to choose from
/// * `selected` - Currently selected color
///
/// # Returns
/// * `Option<Color32>` - The selected color (if changed)
///
/// # Examples
/// ```no_run
/// use rsui::{color_swatch, context::RsuiContext};
/// use eframe::egui::Color32;
///
/// let colors = vec![
///     Color32::from_rgb(255, 0, 0),
///     Color32::from_rgb(0, 255, 0),
///     Color32::from_rgb(0, 0, 255),
/// ];
/// let mut selected = Color32::from_rgb(255, 0, 0);
/// if let Some(new_color) = color_swatch(ui, rsui_ctx, &colors, selected) {
///     selected = new_color;
/// }
/// ```
pub fn color_swatch(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    colors: &[Color32],
    selected: Color32,
) -> Option<Color32> {
    let mut result = None;

    ui.horizontal_wrapped(|ui| {
        for color in colors {
            let is_selected = *color == selected;
            let response = ui.add(
                egui::Button::new("  ")
                    .fill(*color)
                    .stroke(if is_selected {
                        egui::Stroke::new(3.0, rsui_ctx.theme.primary)
                    } else {
                        egui::Stroke::new(1.0, rsui_ctx.theme.border)
                    })
                    .rounding(4.0)
            );

            if response.clicked() {
                result = Some(*color);
            }
        }
    });

    result
}
