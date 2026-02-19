use eframe::egui;

pub fn pagination(ui: &mut egui::Ui, current_page: &mut usize, total_pages: usize) {
    ui.horizontal(|ui| {
        let at_start = *current_page == 0;
        if ui
            .add_enabled(!at_start, egui::Button::new("◀ Prev"))
            .clicked()
        {
            *current_page -= 1;
        }

        ui.label(format!("Page {} of {}", *current_page + 1, total_pages));

        let at_end = *current_page + 1 >= total_pages;
        if ui
            .add_enabled(!at_end, egui::Button::new("Next ▶"))
            .clicked()
        {
            *current_page += 1;
        }
    });
}
