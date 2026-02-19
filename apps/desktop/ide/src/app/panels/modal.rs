use crate::app::state::IdeState;
use crate::types::ui::ModalKind;

pub fn render(ctx: &egui::Context, state: &mut IdeState) {
    let Some(kind) = state.ui.active_modal else {
        return;
    };

    let title = kind.title();

    // Backdrop
    egui::Area::new("modal_backdrop".into())
        .order(egui::Order::Foreground)
        .fixed_pos(egui::Pos2::new(0.0, 0.0))
        .show(ctx, |ui| {
            let rect = ui.max_rect();
            ui.painter()
                .rect_filled(rect, 0.0, egui::Color32::from_black_alpha(140));
        });

    let mut open = true;

    let (default_w, default_h) = default_size(kind);

    egui::Window::new(title)
        .title_bar(false)
        .collapsible(false)
        .resizable(true)
        .open(&mut open)
        .anchor(egui::Align2::CENTER_CENTER, egui::Vec2::ZERO)
        .default_width(default_w)
        .default_height(default_h)
        .show(ctx, |ui| {
            header(ui, state, kind);
            ui.separator();

            match kind {
                ModalKind::Git => crate::app::panels::center::git::render(ui, state),
                ModalKind::GitHub => crate::app::panels::center::github::render(ui, state),
                ModalKind::Extensions => crate::app::panels::center::extensions::render(ui, state),
                ModalKind::Settings => crate::app::panels::center::settings::render(ui, state),
            }
        });

    if !open {
        state.ui.active_modal = None;
    }

    if ctx.input(|i| i.key_pressed(egui::Key::Escape)) {
        state.ui.active_modal = None;
    }
}

fn header(ui: &mut egui::Ui, state: &mut IdeState, kind: ModalKind) {
    ui.horizontal(|ui| {
        ui.label(egui::RichText::new(kind.title()).strong().size(18.0));

        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
            if ui.button("Close  Esc").clicked() {
                state.ui.active_modal = None;
            }
        });
    });
}

fn default_size(kind: ModalKind) -> (f32, f32) {
    match kind {
        ModalKind::Extensions => (760.0, 560.0),
        ModalKind::Settings => (760.0, 560.0),
        ModalKind::Git => (860.0, 560.0),
        ModalKind::GitHub => (860.0, 560.0),
    }
}
