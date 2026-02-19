use egui::{Color32, CornerRadius, Pos2, Rect, Response, Sense, Shape, Stroke, StrokeKind, Ui};

pub fn paint_folder_icon(ui: &mut Ui) -> Response {
    let (rect, resp) = ui.allocate_exact_size(egui::vec2(14.0, 14.0), Sense::click());
    let painter = ui.painter();

    let fill = Color32::from_rgb(245, 194, 66);
    let stroke = Stroke::new(1.0, Color32::from_rgb(160, 120, 30));
    let rounding = CornerRadius::same(2);

    let tab_h = rect.height() * 0.35;
    let tab_w = rect.width() * 0.55;

    let tab = Rect::from_min_size(rect.min, egui::vec2(tab_w, tab_h));
    let body = Rect::from_min_max(egui::pos2(rect.min.x, rect.min.y + tab_h * 0.55), rect.max);

    painter.rect_filled(tab, rounding, fill);
    painter.rect_stroke(tab, rounding, stroke, StrokeKind::Inside);
    painter.rect_filled(body, rounding, fill);
    painter.rect_stroke(body, rounding, stroke, StrokeKind::Inside);

    resp
}

pub fn paint_file_icon(ui: &mut Ui, name: &str) -> Response {
    let (rect, resp) = ui.allocate_exact_size(egui::vec2(14.0, 14.0), Sense::click());
    let painter = ui.painter();

    let (fill, stroke) = file_icon_colors(name);
    let stroke = Stroke::new(1.0, stroke);
    let rounding = CornerRadius::same(2);

    painter.rect_filled(rect, rounding, fill);
    painter.rect_stroke(rect, rounding, stroke, StrokeKind::Inside);

    // folded corner
    let fold = [
        Pos2::new(rect.max.x - rect.width() * 0.38, rect.min.y),
        rect.right_top(),
        Pos2::new(rect.max.x, rect.min.y + rect.height() * 0.38),
    ];
    painter.add(Shape::convex_polygon(
        fold.to_vec(),
        Color32::from_white_alpha(130),
        Stroke::NONE,
    ));

    resp
}

fn file_icon_colors(name: &str) -> (Color32, Color32) {
    let lower = name.to_lowercase();
    if lower.ends_with(".rs") {
        (
            Color32::from_rgb(240, 124, 64),
            Color32::from_rgb(160, 70, 30),
        )
    } else if lower.ends_with(".toml") {
        (
            Color32::from_rgb(110, 170, 255),
            Color32::from_rgb(50, 110, 190),
        )
    } else if lower.ends_with(".json") {
        (
            Color32::from_rgb(90, 210, 140),
            Color32::from_rgb(40, 140, 80),
        )
    } else if lower.ends_with(".md") {
        (
            Color32::from_rgb(190, 150, 240),
            Color32::from_rgb(120, 90, 180),
        )
    } else if lower.ends_with(".png") || lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        (
            Color32::from_rgb(255, 205, 90),
            Color32::from_rgb(190, 140, 40),
        )
    } else {
        (
            Color32::from_rgb(210, 210, 210),
            Color32::from_rgb(140, 140, 140),
        )
    }
}
