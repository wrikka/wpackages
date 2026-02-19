#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_format() {
        assert_eq!(ExportFormat::Json.extension(), "json");
        assert_eq!(ExportFormat::Toml.extension(), "toml");
        assert_eq!(ExportFormat::Yaml.extension(), "yaml");
        assert_eq!(ExportFormat::Css.extension(), "css");
    }

    #[test]
    fn test_theme_export() {
        let theme = RsuiTheme::light();
        let export = ThemeExport::new("test-theme", theme);
        
        assert_eq!(export.name, "test-theme");
        assert_eq!(export.version, "1.0.0");
        assert!(export.description.is_none());
    }

    #[test]
    fn test_theme_export_with_description() {
        let theme = RsuiTheme::light();
        let export = ThemeExport::new("test-theme", theme)
            .with_description("Test theme description");
        
        assert_eq!(export.description, Some("Test theme description".to_string()));
    }

    #[test]
    fn test_export_json() {
        let theme = RsuiTheme::light();
        let export = ThemeExport::new("test-theme", theme);
        
        let service = DefaultThemeExportService::new();
        let json = service.export(&export, ExportFormat::Json).unwrap();
        
        assert!(json.contains("test-theme"));
        assert!(json.contains("1.0.0"));
    }

    #[test]
    fn test_export_css() {
        let theme = RsuiTheme::light();
        let export = ThemeExport::new("test-theme", theme);
        
        let service = DefaultThemeExportService::new();
        let css = service.export(&export, ExportFormat::Css).unwrap();
        
        assert!(css.contains("/* Theme: test-theme */"));
        assert!(css.contains(":root {"));
        assert!(css.contains("--rsui-primary:"));
    }

    #[test]
    fn test_import_json() {
        let theme = RsuiTheme::light();
        let export = ThemeExport::new("test-theme", theme);
        
        let service = DefaultThemeExportService::new();
        let json = service.export(&export, ExportFormat::Json).unwrap();
        
        let imported = service.import(&json, ExportFormat::Json).unwrap();
        assert_eq!(imported.name, "test-theme");
    }

    #[test]
    fn test_color_to_css() {
        let color = eframe::egui::Color32::WHITE;
        let css = color_to_css(color);
        assert!(css.starts_with("rgba("));
        assert!(css.contains("255, 255, 255"));
    }
}
