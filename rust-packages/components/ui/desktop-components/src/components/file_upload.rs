use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

#[path = "file_upload_helpers.rs"]
mod file_upload_helpers;

pub use file_upload_helpers::lighten;

/// File upload state
#[derive(Debug, Clone)]
pub struct FileUploadState {
    pub files: Vec<FileInfo>,
    pub is_dragging: bool,
    pub max_files: Option<usize>,
    pub max_size_mb: Option<f64>,
}

impl Default for FileUploadState {
    fn default() -> Self {
        Self {
            files: Vec::new(),
            is_dragging: false,
            max_files: None,
            max_size_mb: None,
        }
    }
}

impl FileUploadState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_max_files(mut self, max: usize) -> Self {
        self.max_files = Some(max);
        self
    }

    pub fn with_max_size_mb(mut self, size: f64) -> Self {
        self.max_size_mb = Some(size);
        self
    }

    pub fn add_file(&mut self, name: String, size: u64) -> Result<(), String> {
        if let Some(max) = self.max_files {
            if self.files.len() >= max {
                return Err(format!("Maximum {} files allowed", max));
            }
        }

        if let Some(max_size) = self.max_size_mb {
            let size_mb = size as f64 / (1024.0 * 1024.0);
            if size_mb > max_size {
                return Err(format!("File size exceeds maximum of {} MB", max_size));
            }
        }

        self.files.push(FileInfo {
            name,
            size,
            uploaded: false,
        });

        Ok(())
    }

    pub fn remove_file(&mut self, index: usize) {
        if index < self.files.len() {
            self.files.remove(index);
        }
    }

    pub fn clear(&mut self) {
        self.files.clear();
    }

    pub fn total_size(&self) -> u64 {
        self.files.iter().map(|f| f.size).sum()
    }

    pub fn total_size_mb(&self) -> f64 {
        self.total_size() as f64 / (1024.0 * 1024.0)
    }
}

/// File information
#[derive(Debug, Clone)]
pub struct FileInfo {
    pub name: String,
    pub size: u64,
    pub uploaded: bool,
}

impl FileInfo {
    pub fn size_string(&self) -> String {
        let size = self.size as f64;
        if size < 1024.0 {
            format!("{} B", size)
        } else if size < 1024.0 * 1024.0 {
            format!("{:.2} KB", size / 1024.0)
        } else if size < 1024.0 * 1024.0 * 1024.0 {
            format!("{:.2} MB", size / (1024.0 * 1024.0))
        } else {
            format!("{:.2} GB", size / (1024.0 * 1024.0 * 1024.0))
        }
    }

    pub fn extension(&self) -> Option<&str> {
        self.name.rsplit('.').next()
    }
}

/// File upload widget
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The file upload state
/// * `label` - Optional label for the upload area
/// * `accept` - Optional file type filter (e.g., "image/*", ".pdf")
///
/// # Examples
/// ```no_run
/// use rsui::{file_upload, context::RsuiContext, components::file_upload::FileUploadState};
///
/// let mut state = FileUploadState::new()
///     .with_max_files(5)
///     .with_max_size_mb(10.0);
/// file_upload(ui, rsui_ctx, &mut state, Some("Upload Files"), Some("image/*"));
/// ```
pub fn file_upload(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut FileUploadState,
    label: Option<&str>,
    accept: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        if let Some(lbl) = label {
            ui.label(lbl);
        }

        // Upload area
        let upload_rect = ui.available_rect_before_wrap();
        let response = ui.allocate_rect(upload_rect, egui::Sense::click());

        // Draw upload area
        let painter = ui.painter();
        let is_hovered = response.hovered();

        let fill_color = if state.is_dragging {
            theme.primary
        } else if is_hovered {
            lighten(theme.card, 0.1)
        } else {
            theme.card
        };

        let stroke_color = if state.is_dragging {
            theme.primary
        } else if is_hovered {
            theme.primary
        } else {
            theme.border
        };

        painter.rect(
            upload_rect,
            theme.radius,
            fill_color,
            egui::Stroke::new(if state.is_dragging { 2.0 } else { 1.0 }, stroke_color),
        );

        // Upload area content
        ui.allocate_ui_at_rect(upload_rect, |ui| {
            ui.vertical_centered_justified(|ui| {
                ui.add_space(20.0);

                // Icon
                ui.label(egui::RichText::new("📁").size(48.0));

                ui.add_space(12.0);

                // Text
                ui.label(
                    egui::RichText::new("Drag and drop files here")
                        .size(16.0)
                        .color(theme.foreground),
                );

                ui.label(
                    egui::RichText::new("or click to browse")
                        .size(14.0)
                        .color(theme.card_foreground),
                );

                if let Some(accept) = accept {
                    ui.label(
                        egui::RichText::new(format!("Accepted: {}", accept))
                            .size(12.0)
                            .color(theme.card_foreground),
                    );
                }

                ui.add_space(20.0);
            });
        });

        // Handle drag and drop
        if let Some(pointer_pos) = ui.input(|i| i.pointer.hover_pos()) {
            state.is_dragging = upload_rect.contains(pointer_pos) && ui.input(|i| !i.pointer.any_released());
        } else {
            state.is_dragging = false;
        }

        // File list
        if !state.files.is_empty() {
            ui.add_space(16.0);

            ui.label(egui::RichText::new("Files").size(14.0).strong());

            ui.add_space(8.0);

            for (index, file) in state.files.iter().enumerate() {
                ui.horizontal(|ui| {
                    // File icon
                    ui.label("📄");

                    // File name
                    ui.label(
                        egui::RichText::new(&file.name)
                            .size(14.0)
                            .color(theme.foreground),
                    );

                    ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                        // Remove button
                        if ui.button("✕").small().clicked() {
                            state.remove_file(index);
                        }

                        // File size
                        ui.label(
                            egui::RichText::new(file.size_string())
                                .size(12.0)
                                .color(theme.card_foreground),
                        );
                    });
                });
            }

            ui.add_space(8.0);

            // Total size
            ui.horizontal(|ui| {
                ui.label(
                    egui::RichText::new(format!("Total: {:.2} MB", state.total_size_mb()))
                        .size(12.0)
                        .color(theme.card_foreground),
                );

                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    if ui.button("Clear All").small().clicked() {
                        state.clear();
                    }
                });
            });
        }
    });
}

/// Simple file upload button
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `label` - Button label
/// * `accept` - Optional file type filter
///
/// # Returns
/// * `bool` - Whether files were selected
///
/// # Examples
/// ```no_run
/// use rsui::{file_upload_button, context::RsuiContext};
///
/// if file_upload_button(ui, rsui_ctx, "Choose File", Some("image/*")) {
///     println!("Files selected");
/// }
/// ```
pub fn file_upload_button(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    label: &str,
    accept: Option<&str>,
) -> bool {
    let theme = &rsui_ctx.theme;
    let response = ui.button(label);

    if response.clicked() {
        // Note: Actual file dialog integration would need platform-specific code
        // This is a placeholder for future implementation
        true
    } else {
        false
    }
}

/// File progress indicator
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `file_name` - Name of the file
/// * `progress` - Upload progress (0.0 to 1.0)
///
/// # Examples
/// ```no_run
/// use rsui::{file_upload_progress, context::RsuiContext};
///
/// file_upload_progress(ui, rsui_ctx, "document.pdf", 0.75);
/// ```
pub fn file_upload_progress(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    file_name: &str,
    progress: f32,
) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        ui.label("📄");

        ui.vertical(|ui| {
            ui.label(
                egui::RichText::new(file_name)
                    .size(14.0)
                    .color(theme.foreground),
            );

            // Progress bar
            let progress_bar = egui::ProgressBar::new(progress)
                .desired_width(f32::INFINITY)
                .fill(theme.primary)
                .show_percentage();

            ui.add(progress_bar);
        });
    });
}
