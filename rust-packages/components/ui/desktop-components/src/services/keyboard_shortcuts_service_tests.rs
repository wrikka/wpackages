#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_from_str() {
        assert_eq!(Key::from_str("Enter"), Some(Key::Enter));
        assert_eq!(Key::from_str("F1"), Some(Key::F(1)));
        assert_eq!(Key::from_str("a"), Some(Key::Char('a')));
        assert_eq!(Key::from_str("Unknown"), None);
    }

    #[test]
    fn test_shortcut_creation() {
        let s1 = Shortcut::simple(Key::Enter);
        assert_eq!(s1.key, Key::Enter);
        assert!(s1.modifiers.is_empty());

        let s2 = Shortcut::ctrl(Key::Char('s'));
        assert!(s2.modifiers.ctrl);
        assert!(!s2.modifiers.alt);

        let s3 = Shortcut::ctrl_alt_shift(Key::Char('z'));
        assert!(s3.modifiers.ctrl);
        assert!(s3.modifiers.alt);
        assert!(s3.modifiers.shift);
    }

    #[test]
    fn test_default_keyboard_shortcuts_service() {
        let service = DefaultKeyboardShortcutsService::default();
        let action_triggered = std::sync::Arc::new(std::sync::Mutex::new(false));
        
        let shortcut = Shortcut::simple(Key::Enter);
        let action_triggered_clone = action_triggered.clone();
        
        service.register_shortcut(shortcut, Box::new(move || {
            *action_triggered_clone.lock().unwrap() = true;
        })).unwrap();

        service.trigger_shortcut(&shortcut).unwrap();
        assert!(*action_triggered.lock().unwrap());

        assert!(service.unregister_shortcut(&shortcut).is_ok());
        assert!(matches!(
            service.trigger_shortcut(&shortcut),
            Err(RsuiShortcutError::ShortcutNotFound(_))
        ));
    }
}
