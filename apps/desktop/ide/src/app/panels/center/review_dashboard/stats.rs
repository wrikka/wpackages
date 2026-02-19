use crate::app::state::IdeState;

pub(crate) fn render_stats(ui: &mut egui::Ui, state: &mut IdeState) {
    let stats = &state.review_dashboard.stats;

    ui.horizontal(|ui| {
        ui.selectable_value(&mut state.review_dashboard.show_stats, true, "Show Stats");
        ui.selectable_value(&mut state.review_dashboard.show_stats, false, "Hide Stats");
    });

    if state.review_dashboard.show_stats {
        ui.columns(4, |cols| {
            cols[0].heading("Overview");
            cols[0].label(format!("Total: {}", stats.total_reviews));
            cols[0].label(format!("Pending: {}", stats.pending_reviews));
            cols[0].label(format!("In Progress: {}", stats.in_progress_reviews));
            cols[0].label(format!("Approved: {}", stats.approved_reviews));

            cols[1].heading("Changes");
            cols[1].label(format!("Files: {}", stats.total_files_changed));
            cols[1].label(format!("Insertions: +{}", stats.total_insertions));
            cols[1].label(format!("Deletions: -{}", stats.total_deletions));
            cols[1].label(format!("Net: {}", stats.total_insertions as i64 - stats.total_deletions as i64));

            cols[2].heading("By Repository");
            let mut repo_iter = stats.by_repo.iter().peekable();
            while let Some((repo, count)) = repo_iter.next() {
                cols[2].label(format!("{}: {}", repo, count));
                if repo_iter.peek().is_some() {
                    cols[2].add_space(4.0);
                }
            }

            cols[3].heading("By Author");
            let mut author_iter = stats.by_author.iter().peekable();
            while let Some((author, count)) = author_iter.next() {
                cols[3].label(format!("{}: {}", author, count));
                if author_iter.peek().is_some() {
                    cols[3].add_space(4.0);
                }
            }
        });
    }
}
