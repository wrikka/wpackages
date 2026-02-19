#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_theme_variable() {
        let variable = ThemeVariable::new(
            "primary",
            ThemeVariableValue::Color("#3b82f6".to_string()),
            ThemeVariableType::Color,
        );

        assert_eq!(variable.name, "primary");
        assert_eq!(variable.css_variable_name(), "--rsui-primary");
        assert_eq!(variable.css_value(), "#3b82f6");
    }

    #[test]
    fn test_theme_variables() {
        let mut variables = ThemeVariables::new();
        
        assert!(variables.is_empty());
        
        variables.insert(ThemeVariable::new(
            "test",
            ThemeVariableValue::Spacing(16.0),
            ThemeVariableType::Spacing,
        ));
        
        assert_eq!(variables.len(), 1);
        assert!(variables.get("test").is_some());
    }

    #[test]
    fn test_default_theme_variables() {
        let variables = default_theme_variables();
        
        assert!(!variables.is_empty());
        assert!(variables.get("primary").is_some());
        assert!(variables.get("spacing-md").is_some());
        assert!(variables.get("radius-md").is_some());
    }

    #[test]
    fn test_theme_variables_to_css() {
        let mut variables = ThemeVariables::new();
        
        variables.insert(ThemeVariable::new(
            "primary",
            ThemeVariableValue::Color("#3b82f6".to_string()),
            ThemeVariableType::Color,
        ));
        
        variables.insert(ThemeVariable::new(
            "spacing-md",
            ThemeVariableValue::Spacing(16.0),
            ThemeVariableType::Spacing,
        ));
        
        let css = variables.to_css();
        assert!(css.contains("--rsui-primary: #3b82f6;"));
        assert!(css.contains("--rsui-spacing-md: 16px;"));
    }

    #[test]
    fn test_typography_value() {
        let typography = TypographyValue::default();
        assert_eq!(typography.font_family, "Inter");
        assert_eq!(typography.font_size, 14.0);
    }
}
