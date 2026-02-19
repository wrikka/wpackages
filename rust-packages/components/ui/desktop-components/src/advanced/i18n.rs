//! Internationalization (i18n) support
//! 
//! Provides multi-language support using Fluent

use fluent::{FluentBundle, FluentResource};
use fluent_langneg::{negotiate_languages, NegotiationStrategy};
use std::collections::HashMap;
use unic_langid::LanguageIdentifier;

/// I18n manager
pub struct I18nManager {
    bundles: HashMap<String, FluentBundle<fluent::FluentResource>>,
    current_locale: String,
    fallback_locale: String,
}

impl I18nManager {
    /// Create a new i18n manager
    pub fn new() -> Self {
        Self {
            bundles: HashMap::new(),
            current_locale: "en".to_string(),
            fallback_locale: "en".to_string(),
        }
    }

    /// Add a locale
    pub fn add_locale(&mut self, locale: String, ftl: String) -> Result<(), Box<dyn std::error::Error>> {
        let resource = FluentResource::try_new(ftl)?;
        let mut bundle = FluentBundle::new(vec![locale.parse()?]);
        bundle.add_resource(&resource)?;
        self.bundles.insert(locale, bundle);
        Ok(())
    }

    /// Set current locale
    pub fn set_locale(&mut self, locale: String) {
        self.current_locale = locale;
    }

    /// Get message
    pub fn get_message(&self, message_id: &str) -> Option<String> {
        if let Some(bundle) = self.bundles.get(&self.current_locale) {
            if let Some(message) = bundle.get_message(message_id) {
                let mut errors = Vec::new();
                let pattern = message.value.unwrap();
                let value = bundle.format_pattern(&pattern, None, &mut errors);
                return Some(value.to_string());
            }
        }
        
        // Try fallback locale
        if self.current_locale != self.fallback_locale {
            if let Some(bundle) = self.bundles.get(&self.fallback_locale) {
                if let Some(message) = bundle.get_message(message_id) {
                    let mut errors = Vec::new();
                    let pattern = message.value.unwrap();
                    let value = bundle.format_pattern(&pattern, None, &mut errors);
                    return Some(value.to_string());
                }
            }
        }
        
        None
    }

    /// Negotiate best locale
    pub fn negotiate_locale(&self, requested: &[String]) -> String {
        let available: Vec<LanguageIdentifier> = self
            .bundles
            .keys()
            .filter_map(|s| s.parse().ok())
            .collect();
        
        let requested_ids: Vec<LanguageIdentifier> = requested
            .iter()
            .filter_map(|s| s.parse().ok())
            .collect();
        
        let default = self.fallback_locale.parse().unwrap();
        
        let negotiated = negotiate_languages(
            &requested_ids,
            &available,
            Some(&default),
            NegotiationStrategy::Filtering,
        );
        
        negotiated.to_string()
    }
}

impl Default for I18nManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_i18n() {
        let mut manager = I18nManager::new();
        manager.add_locale("en".to_string(), "hello = Hello".to_string()).unwrap();
        
        assert_eq!(manager.get_message("hello"), Some("Hello".to_string()));
    }
}
