use crate::app::state::IdeState;

pub(crate) fn render_comparison_controls(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.columns(2, |cols| {
        cols[0].heading("Commit / Branch A");
        cols[0].horizontal(|ui| {
            ui.label("Commit:");
            ui.add(
                egui::TextEdit::singleline(
                    &mut state.commit_comparison.commit_a.get_or_insert_with(String::new)
                )
                .hint_text("Commit hash or leave empty")
                .desired_width(200.0),
            );
        });
        cols[0].horizontal(|ui| {
            ui.label("Branch:");
            ui.add(
                egui::TextEdit::singleline(
                    &mut state.commit_comparison.branch_a.get_or_insert_with(String::new)
                )
                .hint_text("Branch name")
                .desired_width(200.0),
            );
        });

        cols[1].heading("Commit / Branch B");
        cols[1].horizontal(|ui| {
            ui.label("Commit:");
            ui.add(
                egui::TextEdit::singleline(
                    &mut state.commit_comparison.commit_b.get_or_insert_with(String::new)
                )
                .hint_text("Commit hash or leave empty")
                .desired_width(200.0),
            );
        });
        cols[1].horizontal(|ui| {
            ui.label("Branch:");
            ui.add(
                egui::TextEdit::singleline(
                    &mut state.commit_comparison.branch_b.get_or_insert_with(String::new)
                )
                .hint_text("Branch name")
                .desired_width(200.0),
            );
        });
    });

    ui.separator();

    ui.horizontal(|ui| {
        if ui.button("Compare").clicked() {
            super::git_ops::perform_comparison(state);
        }

        if state.commit_comparison.comparing {
            ui.add(egui::Spinner::new());
        }

        ui.separator();

        ui.checkbox(&mut state.commit_comparison.show_side_by_side, "Side by Side");
        ui.checkbox(&mut state.commit_comparison.show_unified, "Unified");
    });
}
