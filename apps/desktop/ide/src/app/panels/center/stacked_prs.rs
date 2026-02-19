use crate::app::state::stacked_prs::{StackedPrsState, PrStatus, ReviewStatus};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_stacked_prs_panel(
    ctx: &Context,
    state: &mut StackedPrsState,
) {
    egui::Window::new("📚 Stacked PRs")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Auto-rebase:");
                ui.checkbox(&mut state.auto_rebase_enabled, "Enabled");
                ui.label("Auto-merge:");
                ui.checkbox(&mut state.auto_merge_enabled, "Enabled");
            });

            ui.separator();

            ui.horizontal(|ui| {
                if ui.button("➕ New Stack").clicked() {
                    // TODO: Create new stack
                }
                if ui.button("🔄 Rebase All").clicked() {
                    // TODO: Rebase all stacks
                }
            });

            ui.separator();

            ui.heading("PR Stacks");
            ScrollArea::vertical()
                .max_height(400.0)
                .show(ui, |ui| {
                    for stack in &state.stacks {
                        render_pr_stack(ui, stack, state);
                    }
                });

            if state.stacks.is_empty() {
                ui.label("No PR stacks. Create a new stack to get started.");
            }
        });
}

fn render_pr_stack(ui: &mut Ui, stack: &crate::app::state::stacked_prs::PrStack, state: &StackedPrsState) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.heading(&stack.name);
            ui.label(format!("Base: {}", stack.base_branch));
        });

        for pr in &stack.prs {
            ui.group(|ui| {
                ui.horizontal(|ui| {
                    let status_icon = match pr.status {
                        PrStatus::Open => "📝",
                        PrStatus::Merged => "✅",
                        PrStatus::Closed => "❌",
                        PrStatus::Draft => "📄",
                    };
                    ui.label(status_icon);

                    let review_icon = match pr.review_status {
                        ReviewStatus::Pending => "⏳",
                        ReviewStatus::Approved => "✅",
                        ReviewStatus::ChangesRequested => "🔄",
                        ReviewStatus::Reviewed => "👁️",
                    };
                    ui.label(review_icon);

                    ui.label(format!("#{}: {}", pr.number, pr.title));
                    ui.label(&pr.branch);
                });

                if let Some(depends_on) = pr.depends_on {
                    ui.label(format!("Depends on: #{}", depends_on));
                }
            });
        }
    });
}
