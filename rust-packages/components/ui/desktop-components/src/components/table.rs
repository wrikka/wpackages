use eframe::egui;
use egui_extras::{Column, TableBuilder};

pub fn table<R>(
    ui: &mut egui::Ui,
    id: impl std::hash::Hash,
    columns: &[Column],
    header: impl FnOnce(&mut egui_extras::TableRow),
    body: impl FnOnce(&mut egui_extras::TableBody) -> R,
) -> R {
    let mut table = TableBuilder::new(ui).striped(true).id_salt(id);

    for col in columns {
        table = table.column(*col);
    }

    let mut result = None;
    table
        .header(20.0, |mut row| header(&mut row))
        .body(|mut b| {
            result = Some(body(&mut b));
        });
    result.unwrap()
}
