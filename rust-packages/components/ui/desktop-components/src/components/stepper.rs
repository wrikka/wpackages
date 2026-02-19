use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Step state
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StepState {
    Pending,
    Active,
    Completed,
}

/// Step item
#[derive(Debug, Clone)]
pub struct Step {
    pub label: String,
    pub description: Option<String>,
    pub state: StepState,
}

impl Step {
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            description: None,
            state: StepState::Pending,
        }
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn with_state(mut self, state: StepState) -> Self {
        self.state = state;
        self
    }
}

/// Stepper state
#[derive(Debug, Clone)]
pub struct StepperState {
    pub current_step: usize,
    pub steps: Vec<Step>,
}

impl Default for StepperState {
    fn default() -> Self {
        Self {
            current_step: 0,
            steps: Vec::new(),
        }
    }
}

impl StepperState {
    pub fn new(steps: Vec<Step>) -> Self {
        Self {
            current_step: 0,
            steps,
        }
    }

    pub fn next(&mut self) -> bool {
        if self.current_step < self.steps.len() - 1 {
            self.current_step += 1;
            self.update_step_states();
            true
        } else {
            false
        }
    }

    pub fn previous(&mut self) -> bool {
        if self.current_step > 0 {
            self.current_step -= 1;
            self.update_step_states();
            true
        } else {
            false
        }
    }

    pub fn go_to(&mut self, index: usize) -> bool {
        if index < self.steps.len() {
            self.current_step = index;
            self.update_step_states();
            true
        } else {
            false
        }
    }

    pub fn is_first(&self) -> bool {
        self.current_step == 0
    }

    pub fn is_last(&self) -> bool {
        self.current_step == self.steps.len() - 1
    }

    pub fn current_step(&self) -> &Step {
        &self.steps[self.current_step]
    }

    fn update_step_states(&mut self) {
        for (index, step) in self.steps.iter_mut().enumerate() {
            step.state = if index < self.current_step {
                StepState::Completed
            } else if index == self.current_step {
                StepState::Active
            } else {
                StepState::Pending
            };
        }
    }
}

/// Simple stepper widget (legacy)
pub fn stepper(ui: &mut egui::Ui, steps: &[&str], current_step: usize) {
    ui.horizontal(|ui| {
        for (i, step) in steps.iter().enumerate() {
            if i > 0 {
                ui.separator();
            }

            let is_done = i < current_step;
            let is_current = i == current_step;

            let mut text = egui::RichText::new(format!(" {} ", step));
            if is_current {
                text = text.strong();
            }
            if is_done {
                text = text.color(egui::Color32::DARK_GRAY);
            }

            ui.label(text);
        }
    });
}

/// Full stepper widget with state management
///
/// Multi-step form wizard with navigation controls
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The stepper state
/// * `content` - Function to render the current step content
///
/// # Examples
/// ```no_run
/// use rsui::{stepper_full, context::RsuiContext, components::stepper::{StepperState, Step, StepState}};
///
/// let steps = vec![
///     Step::new("Step 1").with_state(StepState::Active),
///     Step::new("Step 2"),
///     Step::new("Step 3"),
/// ];
/// let mut state = StepperState::new(steps);
/// stepper_full(ui, rsui_ctx, &mut state, |ui, step| {
///     ui.label(&step.label);
/// });
/// ```
pub fn stepper_full(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut StepperState,
    content: impl FnOnce(&mut Ui, &Step),
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(24.0, 24.0))
        .show(ui, |ui| {
            // Step indicators
            ui.horizontal(|ui| {
                for (index, step) in state.steps.iter().enumerate() {
                    // Step circle
                    let circle_color = match step.state {
                        StepState::Completed => theme.primary,
                        StepState::Active => theme.primary,
                        StepState::Pending => theme.border,
                    };

                    let circle_stroke = egui::Stroke::new(2.0, circle_color);
                    let circle_fill = if step.state == StepState::Active {
                        theme.primary
                    } else {
                        theme.card
                    };

                    let painter = ui.painter();
                    let rect = ui.allocate_space(egui::Vec2::new(32.0, 32.0)).1;

                    painter.circle(
                        rect.center(),
                        14.0,
                        circle_fill,
                        circle_stroke,
                    );

                    // Step number or checkmark
                    let text = match step.state {
                        StepState::Completed => "✓",
                        StepState::Active => &format!("{}", index + 1),
                        StepState::Pending => &format!("{}", index + 1),
                    };

                    let text_color = match step.state {
                        StepState::Completed => theme.primary_foreground,
                        StepState::Active => theme.primary_foreground,
                        StepState::Pending => theme.card_foreground,
                    };

                    painter.text(
                        rect.center(),
                        egui::Align2::CENTER_CENTER,
                        text,
                        egui::FontId::default(),
                        text_color,
                    );

                    // Step label
                    ui.label(
                        egui::RichText::new(&step.label)
                            .size(14.0)
                            .color(if step.state == StepState::Active {
                                theme.foreground
                            } else {
                                theme.card_foreground
                            }),
                    );

                    // Connector line (not for last step)
                    if index < state.steps.len() - 1 {
                        ui.add_space(8.0);
                        let line_rect = ui.allocate_space(egui::Vec2::new(40.0, 2.0)).1;
                        painter.line_segment(
                            [line_rect.left_center(), line_rect.right_center()],
                            (2.0, theme.border),
                        );
                        ui.add_space(8.0);
                    }
                }
            });

            ui.add_space(24.0);

            // Current step content
            content(ui, state.current_step());

            ui.add_space(24.0);

            // Navigation buttons
            ui.horizontal(|ui| {
                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    // Next/Finish button
                    if state.is_last() {
                        if ui.button("Finish").clicked() {
                            // Handle finish
                            println!("Stepper finished");
                        }
                    } else {
                        if ui.button("Next").clicked() {
                            state.next();
                        }
                    }

                    // Previous button
                    if !state.is_first() {
                        if ui.button("Previous").clicked() {
                            state.previous();
                        }
                    }
                });
            });
        });
}

/// Compact stepper widget
///
/// Smaller version of stepper for limited space
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The stepper state
///
/// # Examples
/// ```no_run
/// use rsui::{stepper_compact, context::RsuiContext, components::stepper::{StepperState, Step, StepState}};
///
/// let steps = vec![
///     Step::new("Step 1").with_state(StepState::Active),
///     Step::new("Step 2"),
/// ];
/// let mut state = StepperState::new(steps);
/// stepper_compact(ui, rsui_ctx, &mut state);
/// ```
pub fn stepper_compact(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &StepperState) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        for (index, step) in state.steps.iter().enumerate() {
            // Step indicator
            let is_active = step.state == StepState::Active;
            let is_completed = step.state == StepState::Completed;

            let response = ui.add(
                egui::Button::new(
                    egui::RichText::new(format!("{} {}", index + 1, step.label))
                        .size(12.0)
                        .color(if is_active {
                            theme.foreground
                        } else {
                            theme.card_foreground
                        })
                )
                .fill(if is_active {
                    theme.primary
                } else if is_completed {
                    lighten(theme.primary, 0.3)
                } else {
                    theme.input
                })
                .stroke(if is_active {
                    egui::Stroke::new(2.0, theme.primary)
                } else {
                    egui::Stroke::new(1.0, theme.border)
                })
                .rounding(4.0)
                .small()
            );

            if response.clicked() {
                let mut new_state = state.clone();
                new_state.go_to(index);
            }

            if index < state.steps.len() - 1 {
                ui.label("→");
            }
        }
    });

    // Progress bar
    let progress = (state.current_step + 1) as f32 / state.steps.len() as f32;
    ui.add_space(8.0);
    ui.add(
        egui::ProgressBar::new(progress)
            .desired_width(f32::INFINITY)
            .fill(theme.primary)
            .show_percentage()
    );
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
    fn test_step() {
        let step = Step::new("Step 1");
        assert_eq!(step.label, "Step 1");
        assert!(step.description.is_none());
        assert_eq!(step.state, StepState::Pending);

        let step_with_desc = Step::new("Step 2")
            .with_description("Description")
            .with_state(StepState::Active);
        assert_eq!(step_with_desc.description, Some("Description".to_string()));
        assert_eq!(step_with_desc.state, StepState::Active);
    }

    #[test]
    fn test_stepper_state() {
        let steps = vec![
            Step::new("Step 1"),
            Step::new("Step 2"),
            Step::new("Step 3"),
        ];
        let mut state = StepperState::new(steps);

        assert_eq!(state.current_step, 0);
        assert!(state.is_first());
        assert!(!state.is_last());

        assert!(state.next());
        assert_eq!(state.current_step, 1);
        assert!(!state.is_first());
        assert!(!state.is_last());

        assert!(state.next());
        assert_eq!(state.current_step, 2);
        assert!(state.is_last());

        assert!(!state.next());

        assert!(state.previous());
        assert_eq!(state.current_step, 1);

        assert!(!state.previous());

        assert!(state.go_to(0));
        assert_eq!(state.current_step, 0);

        assert!(!state.go_to(5));
    }
}
