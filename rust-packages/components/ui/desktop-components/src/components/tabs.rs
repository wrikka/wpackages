use crate::{context::RsuiContext, components::tab::Tab};
use eframe::egui;

pub fn tabs<'a>(
    ui: &mut egui::Ui,
    ctx: &RsuiContext,
    id: impl std::hash::Hash,
    tabs: Vec<Tab<'a>>,
) {
    let id = egui::Id::new(id);

    // Read the state
    let mut state = ui.memory_mut(|m| *m.data.get_temp_mut_or_insert_with(id, || 0));

    // Draw tabs and update state
    ui.horizontal(|ui| {
        for (i, tab) in tabs.iter().enumerate() {
            if super::tab_button(ui, ctx, tab.title(), state == i).clicked() {
                state = i;
            }
        }
    });

    // Store the updated state
    ui.data_mut(|d| d.insert_temp(id, state));

    // Show content for the active tab
    ui.separator();
    ui.add_space(ctx.theme.radius);

    if let Some(tab) = tabs.into_iter().nth(state) {
        tab.show(ui);
    }
}
