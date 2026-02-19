use crate::app::state::IdeState;

pub(crate) fn render_reviews_list(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Reviews");
    
    let filtered_reviews = crate::app::state::review_dashboard::ReviewDashboardService::filter_reviews(
        &state.review_dashboard.reviews,
        &state.review_dashboard.filter,
    );

    egui::ScrollArea::vertical()
        .id_salt("review_dashboard")
        .max_height(400.0)
        .show(ui, |ui| {
            for review in &filtered_reviews {
                let selected = state.review_dashboard.selected_review.as_ref() == Some(&review.id);
                
                ui.group(|ui| {
                    ui.horizontal(|ui| {
                        ui.selectable_label(selected, &review.repo_name);
                        
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            super::badges::render_priority_badge(ui, &review.priority);
                            super::badges::render_status_badge(ui, &review.status);
                        });
                    });
                    
                    ui.horizontal(|ui| {
                        ui.label(&review.commit_message);
                        ui.label(format!("by {}", review.author));
                    });
                    
                    ui.horizontal(|ui| {
                        ui.label(format!("📝 {} files changed", review.files_changed));
                        ui.label(format!("+{} -{}", review.insertions, review.deletions));
                        
                        if !review.labels.is_empty() {
                            ui.separator();
                            for label in &review.labels {
                                ui.label(format!("#{}", label));
                            }
                        }
                    });
                    
                    if ui.button("View Details").clicked() {
                        state.review_dashboard.selected_review = Some(review.id.clone());
                    }
                });
                
                ui.add_space(8.0);
            }
        });
}
