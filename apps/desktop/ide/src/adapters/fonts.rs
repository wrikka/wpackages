use std::path::Path;

pub fn setup_fonts(ctx: &egui::Context) {
    let mut defs = egui::FontDefinitions::default();

    let font_candidates: [(&str, &[&str]); 2] = [
        (
            "proportional",
            &[
                "segoeui.ttf",
                "segoeuii.ttf",
                "segoeuib.ttf",
                "seguiemj.ttf",
                "seguisym.ttf",
            ],
        ),
        (
            "monospace",
            &[
                "CascadiaMono.ttf",
                "CascadiaCode.ttf",
                "consola.ttf",
                "lucon.ttf",
            ],
        ),
    ];

    for (family, files) in font_candidates {
        for file in files {
            if let Some(font_path) = windows_font_path(file) {
                if let Ok(bytes) = std::fs::read(&font_path) {
                    let key = format!("{family}:{file}");
                    defs.font_data
                        .insert(key.clone(), egui::FontData::from_owned(bytes).into());

                    let target_family = match family {
                        "monospace" => egui::FontFamily::Monospace,
                        _ => egui::FontFamily::Proportional,
                    };

                    defs.families
                        .entry(target_family)
                        .or_default()
                        .insert(0, key);
                }
            }
        }
    }

    ctx.set_fonts(defs);
}

fn windows_font_path(file: &str) -> Option<String> {
    let windir = std::env::var("WINDIR").ok()?;
    let path = Path::new(&windir).join("Fonts").join(file);
    path.to_str().map(|s| s.to_string())
}
