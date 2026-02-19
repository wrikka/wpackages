use crate::types::AppConfig;

impl AppConfig {
    /// Sets a custom property.
    ///
    /// # Arguments
    ///
    /// * `key` - The property key
    /// * `value` - The property value
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    /// use serde_json::json;
    ///
    /// let mut config = AppConfig::default();
    /// config.set_property("custom_key".to_string(), json!("custom_value"));
    /// ```
    pub fn set_property(&mut self, key: String, value: serde_json::Value) {
        self.custom_properties.insert(key, value);
    }

    /// Gets a custom property.
    ///
    /// # Arguments
    ///
    /// * `key` - The property key
    ///
    /// # Returns
    ///
    /// Returns `Some(&value)` if the property exists, `None` otherwise.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// if let Some(value) = config.get_property("custom_key") {
    ///     println!("Value: {:?}", value);
    /// }
    /// ```
    pub fn get_property(&self, key: &str) -> Option<&serde_json::Value> {
        self.custom_properties.get(key)
    }

    /// Removes a custom property.
    ///
    /// # Arguments
    ///
    /// * `key` - The property key
    ///
    /// # Returns
    ///
    /// Returns `Some(value)` if the property existed, `None` otherwise.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    ///
    /// let mut config = AppConfig::default();
    /// config.remove_property("custom_key");
    /// ```
    pub fn remove_property(&mut self, key: &str) -> Option<serde_json::Value> {
        self.custom_properties.remove(key)
    }
}
