#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_default() {
        let config = RsuiConfig::default();
        assert_eq!(config.theme.mode, "dark");
        assert_eq!(config.window.width, 1200);
    }
}
