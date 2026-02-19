use crate::app::state::ai_review::{AiReviewState, ReviewComment, ReviewSeverity, ReviewCategory};
use egui::{Context, Ui, ScrollArea, Layout, Color32};

pub fn render_ai_review_panel(
    ctx: &Context,
    state: &mut AiReviewState,
) {
    egui::Window::new("🤖 AI Code Review")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Auto-review:");
                ui.checkbox(&mut state.auto_review_enabled, "Enabled");
            });

            ui.separator();

            if let Some(pr) = &state.current_pr {
                ui.heading(format!("PR #{}: {}", pr.pr_number, pr.title));
                ui.label(format!("Author: {}", pr.author));
                ui.label(format!("Files changed: {}", pr.files_changed.len()));

                ui.separator();

                ui.horizontal(|ui| {
                    ui.label("Overall Score:");
                    ui.colored_label(Color32::LIGHT_GREEN, format!("Security: {:.1}", pr.overall_score.security));
                    ui.colored_label(Color32::LIGHT_BLUE, format!("Performance: {:.1}", pr.overall_score.performance));
                    ui.colored_label(Color32::LIGHT_YELLOW, format!("Maintainability: {:.1}", pr.overall_score.maintainability));
                });

                ui.separator();

                ui.label("Summary:");
                ui.label(&pr.summary);

                ui.separator();

                ui.heading("Recommendations:");
                ScrollArea::vertical()
                    .max_height(200.0)
                    .show(ui, |ui| {
                        for (i, rec) in pr.recommendations.iter().enumerate() {
                            ui.label(format!("{}. {}", i + 1, rec));
                        }
                    });

                ui.separator();

                ui.heading("File Reviews:");
                ScrollArea::vertical()
                    .max_height(300.0)
                    .show(ui, |ui| {
                        for file_review in &pr.files_changed {
                            ui.group(|ui| {
                                ui.horizontal(|ui| {
                                    ui.label(&file_review.path);
                                    ui.label(format!("+{} -{}", file_review.additions, file_review.deletions));
                                });

                                for comment in &file_review.comments {
                                    render_comment(ui, comment);
                                }
                            });
                        }
                    });
            } else {
                ui.label("No PR loaded. Open a pull request to start AI review.");
            }
        });
}

fn render_comment(ui: &mut Ui, comment: &ReviewComment) {
    let color = match comment.severity {
        ReviewSeverity::Info => Color32::LIGHT_BLUE,
        ReviewSeverity::Warning => Color32::YELLOW,
        ReviewSeverity::Error => Color32::LIGHT_RED,
        ReviewSeverity::Critical => Color32::RED,
    };

    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.colored_label(color, format!("{:?}", comment.severity));
            ui.label(format!("{:?}", comment.category));
            ui.label(format!("Line {}", comment.line));
        });

        ui.label(&comment.message);

        if let Some(suggestion) = &comment.suggestion {
            ui.group(|ui| {
                ui.label("💡 Suggestion:");
                ui.label(suggestion);
            });
        }

        ui.label(format!("Confidence: {:.0}%", comment.confidence * 100.0));
    });
}
