use eframe::egui;

pub struct Tab<'a> {
    title: String,
    contents: Box<dyn FnOnce(&mut egui::Ui) + 'a>,
}

impl<'a> Tab<'a> {
    pub fn new(title: impl Into<String>, contents: impl FnOnce(&mut egui::Ui) + 'a) -> Self {
        Self {
            title: title.into(),
            contents: Box::new(contents),
        }
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn show(self, ui: &mut egui::Ui) {
        (self.contents)(ui);
    }
}
