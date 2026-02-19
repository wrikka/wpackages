use crate::app::state::IdeState;
use git_analytics::{GitAnalytics, ReportGenerator};

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Git History Analytics");
    ui.separator();

    ui.horizontal(|ui| {
        if ui.button("Generate Report").clicked() {
            generate_analytics(state);
        }

        if state.git_analytics.generating {
            ui.add(egui::Spinner::new());
        }
    });

    ui.separator();

    if let Some(report) = &state.git_analytics.report {
        render_report(ui, state, report);
    } else {
        ui.label("Click 'Generate Report' to analyze repository");
    }
}

fn render_report(ui: &mut egui::Ui, state: &mut IdeState, report: &git_analytics::AnalyticsReport) {
    ui.horizontal(|ui| {
        ui.heading("Report Summary");
        ui.label(format!("Health Score: {:.1}/100", report.summary.code_health_score));
    });

    ui.columns(3, |cols| {
        cols[0].heading("Overview");
        cols[0].label(format!("Total Contributors: {}", report.summary.total_contributors));
        cols[0].label(format!("Total Branches: {}", report.summary.total_branches));
        cols[0].label(format!("Total Tags: {}", report.summary.total_tags));
        if let Some(contributor) = &report.summary.most_active_contributor {
            cols[0].label(format!("Most Active: {}", contributor));
        }

        cols[1].heading("Commit Metrics");
        cols[1].label(format!("Total Commits: {}", report.commit_metrics.total_commits));
        cols[1].label(format!("Avg/Day: {:.2}", report.commit_metrics.avg_commits_per_day));
        cols[1].label(format!("Max/Day: {}", report.commit_metrics.max_commits_in_day));

        cols[2].heading("Date Range");
        if let Some(first) = &report.commit_metrics.first_commit {
            cols[2].label(format!("First: {}", first.format("%Y-%m-%d")));
        }
        if let Some(last) = &report.commit_metrics.last_commit {
            cols[2].label(format!("Last: {}", last.format("%Y-%m-%d")));
        }
    });

    ui.separator();
    ui.heading("Top Contributors");
    egui::ScrollArea::vertical()
        .max_height(200.0)
        .show(ui, |ui| {
            for contributor in report.contributors.iter().take(10) {
                ui.group(|ui| {
                    ui.horizontal(|ui| {
                        ui.heading(&contributor.author);
                        ui.label(format!("{} commits", contributor.total_commits));
                    });
                    ui.label(format!("+{} -{} | Files: {}", 
                        contributor.total_additions, 
                        contributor.total_deletions,
                        contributor.files_touched
                    ));
                });
                ui.add_space(4.0);
            }
        });
}

fn generate_analytics(state: &mut IdeState) {
    if let Some(repo_root) = &state.workspace.selected_repo {
        state.git_analytics.generating = true;

        let repo_path = repo_root.clone();
        tokio::spawn(async move {
            let analytics = GitAnalytics::new(repo_path.clone());
            
            match analytics.analyze_commits() {
                Ok(commit_metrics) => {
                    match analytics.analyze_contributors() {
                        Ok(contributors) => {
                            match analytics.analyze_branches() {
                                Ok(branches) => {
                                    match analytics.analyze_tags() {
                                        Ok(tags) => {
                                            let report = ReportGenerator::generate(
                                                repo_path.clone(),
                                                commit_metrics,
                                                contributors,
                                                branches,
                                                tags,
                                            );
                                            
                                            // TODO: Implement report update via channel or async mechanism
                                            // - Send analytics report to state
                                            // - Update UI to display report
                                            // For now, this is a placeholder that would be replaced with actual state update
                                        }
                                        Err(e) => eprintln!("Failed to analyze tags: {}", e),
                                    }
                                }
                                Err(e) => eprintln!("Failed to analyze branches: {}", e),
                            }
                        }
                        Err(e) => eprintln!("Failed to analyze contributors: {}", e),
                    }
                }
                Err(e) => eprintln!("Failed to analyze commits: {}", e),
            }
        });
    }
}
