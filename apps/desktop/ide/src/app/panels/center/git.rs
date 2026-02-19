use crate::app::state::IdeState;

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Git");
    ui.separator();

    ui.columns(2, |cols| {
        cols[0].heading("Status");
        egui::ScrollArea::vertical()
            .id_salt("status")
            .max_height(240.0)
            .show(&mut cols[0], |ui| {
                for s in &state.git.status {
                    ui.horizontal(|ui| {
                        ui.monospace(s.status.as_str());
                        ui.label(&s.path);
                    });
                }
            });

        cols[1].heading("Branches");
        egui::ScrollArea::vertical()
            .id_salt("branches")
            .max_height(240.0)
            .show(&mut cols[1], |ui| {
                for b in &state.git.branches {
                    ui.horizontal(|ui| {
                        ui.monospace(if b.is_head { "HEAD" } else { "" });
                        ui.label(&b.name);
                    });
                }
            });
    });

    ui.separator();
    ui.heading("Commits");
    egui::ScrollArea::vertical()
        .id_salt("commits")
        .max_height(200.0)
        .show(ui, |ui| {
            for c in &state.git.commits {
                ui.horizontal(|ui| {
                    ui.monospace(&c.id[..std::cmp::min(7, c.id.len())]);
                    ui.label(&c.summary);
                });
            }
        });

    ui.separator();
    ui.heading("Diff (HEAD)");
    egui::ScrollArea::vertical().id_salt("diff").show(ui, |ui| {
        for d in &state.git.diffs {
            ui.label(&d.path);
            ui.monospace(&d.diff);
            ui.separator();
        }
    });
}
