//! Plan panel UI component

use ratatui::{
    layout::{Alignment, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span, Text},
    widgets::{Block, Borders, List, ListItem, Paragraph, Wrap},
    Frame,
};

use crate::types::{ExecutionMode, ExecutionPlan, PlanStatus};

/// Plan panel component
pub struct PlanPanel {
    /// Current execution plan
    pub plan: Option<ExecutionPlan>,
    /// Current execution mode
    pub mode: ExecutionMode,
    /// Selected step index
    pub selected_step: usize,
}

impl PlanPanel {
    /// Create a new plan panel
    pub fn new() -> Self {
        Self {
            plan: None,
            mode: ExecutionMode::Build,
            selected_step: 0,
        }
    }

    /// Set the current plan
    pub fn set_plan(&mut self, plan: ExecutionPlan) {
        self.plan = Some(plan);
        self.selected_step = 0;
    }

    /// Set the execution mode
    pub fn set_mode(&mut self, mode: ExecutionMode) {
        self.mode = mode;
    }

    /// Select next step
    pub fn next_step(&mut self) {
        if let Some(plan) = &self.plan {
            if self.selected_step < plan.steps.len().saturating_sub(1) {
                self.selected_step += 1;
            }
        }
    }

    /// Select previous step
    pub fn prev_step(&mut self) {
        if self.selected_step > 0 {
            self.selected_step -= 1;
        }
    }

    /// Toggle approval for selected step
    pub fn toggle_step_approval(&mut self) {
        if let Some(plan) = &mut self.plan {
            if let Some(step) = plan.steps.get_mut(self.selected_step) {
                step.approved = !step.approved;
            }
        }
    }

    /// Render the plan panel
    pub fn render(&self, frame: &mut Frame, area: Rect) {
        let mode_color = if self.mode == ExecutionMode::Plan {
            Color::Yellow
        } else {
            Color::Green
        };

        let mode_text = format!("Mode: {:?} (Tab to switch)", self.mode);
        let title = Line::from(vec![
            Span::styled("Execution Plan", Style::default().fg(Color::Cyan)),
            Span::raw(" - "),
            Span::styled(mode_text, Style::default().fg(mode_color)),
        ]);

        let block = Block::default()
            .title(title)
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Blue));

        if let Some(plan) = &self.plan {
            self.render_plan(frame, area, block, plan);
        } else {
            self.render_empty(frame, area, block);
        }
    }

    /// Render plan with steps
    fn render_plan(&self, frame: &mut Frame, area: Rect, block: Block, plan: &ExecutionPlan) {
        let mut lines = Vec::new();

        // Plan description
        lines.push(Line::from(vec![
            Span::styled("Description: ", Style::default().fg(Color::Cyan)),
            Span::styled(&plan.description, Style::default()),
        ]));
        lines.push(Line::default());

        // Status
        let status_color = match plan.status {
            PlanStatus::Generating => Color::Yellow,
            PlanStatus::Ready => Color::Green,
            PlanStatus::Executing => Color::Blue,
            PlanStatus::Completed => Color::Green,
            PlanStatus::Failed => Color::Red,
        };
        lines.push(Line::from(vec![
            Span::styled("Status: ", Style::default().fg(Color::Cyan)),
            Span::styled(
                format!("{:?}", plan.status),
                Style::default().fg(status_color),
            ),
        ]));
        lines.push(Line::default());

        // Steps
        lines.push(Line::from(vec![Span::styled(
            "Steps:",
            Style::default().fg(Color::Cyan),
        )]));
        lines.push(Line::default());

        for (i, step) in plan.steps.iter().enumerate() {
            let is_selected = i == self.selected_step;
            let approval_icon = if step.approved { "✓" } else { "○" };
            let approval_color = if step.approved {
                Color::Green
            } else {
                Color::Gray
            };

            let step_line = Line::from(vec![
                Span::styled(
                    format!("{} Step {}: ", approval_icon, step.step_number),
                    Style::default().fg(approval_color),
                ),
                Span::styled(
                    &step.description,
                    if is_selected {
                        Style::default()
                            .fg(Color::White)
                            .add_modifier(Modifier::BOLD)
                    } else {
                        Style::default()
                    },
                ),
            ]);

            lines.push(step_line);

            // Show files for selected step
            if is_selected {
                lines.push(Line::from(vec![
                    Span::raw("  "),
                    Span::styled(
                        format!("• {}", step.description),
                        Style::default().fg(Color::Gray),
                    ),
                ]));
            }
        }

        // Summary
        lines.push(Line::default());
        let approved_count = plan.steps.iter().filter(|s| s.approved).count();
        lines.push(Line::from(vec![Span::styled(
            format!("Approved: {}/{}", approved_count, plan.steps.len()),
            Style::default().fg(Color::Cyan),
        )]));

        let text = Text::from(lines);
        let paragraph = Paragraph::new(text).block(block).wrap(Wrap { trim: true });

        frame.render_widget(paragraph, area);
    }

    /// Render empty state
    fn render_empty(&self, frame: &mut Frame, area: Rect, block: Block) {
        let text = Text::from(vec![
            Line::from("No execution plan loaded."),
            Line::from(""),
            Line::from("In Plan mode, AI will generate a plan before executing."),
            Line::from("Press Tab to switch between Plan and Build mode."),
        ]);

        let paragraph = Paragraph::new(text)
            .block(block)
            .wrap(Wrap { trim: true })
            .alignment(Alignment::Center);

        frame.render_widget(paragraph, area);
    }
}

impl Default for PlanPanel {
    fn default() -> Self {
        Self::new()
    }
}
