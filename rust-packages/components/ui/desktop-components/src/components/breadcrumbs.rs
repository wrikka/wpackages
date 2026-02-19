use eframe::egui;

pub struct BreadcrumbItem {
    pub text: String,
    pub on_click: Option<Box<dyn FnOnce()>>,
}

impl BreadcrumbItem {
    pub fn new(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            on_click: None,
        }
    }

    pub fn on_click(mut self, on_click: impl FnOnce() + 'static) -> Self {
        self.on_click = Some(Box::new(on_click));
        self
    }
}

pub fn breadcrumbs(ui: &mut egui::Ui, items: Vec<BreadcrumbItem>) {
    ui.horizontal(|ui| {
        for (i, item) in items.into_iter().enumerate() {
            if i > 0 {
                ui.label("/");
            }

            if let Some(on_click) = item.on_click {
                if ui.link(&item.text).clicked() {
                    (on_click)();
                }
            } else {
                ui.label(&item.text);
            }
        }
    });
}
