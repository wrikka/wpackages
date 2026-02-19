//! Configuration signing
//!
//! This module provides digital signature support for configuration files.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};
use std::path::Path;

/// Represents a signed configuration.
#[derive(Debug, Clone)]
pub struct SignedConfig {
    config: AppConfig,
    signature: Vec<u8>,
    key_id: Option<String>,
    timestamp: String,
}

impl SignedConfig {
    /// Creates a new signed configuration.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to sign
    /// * `signature` - The signature
    /// * `key_id` - Optional key identifier
    ///
    /// # Returns
    ///
    /// Returns a new signed configuration.
    pub fn new(config: AppConfig, signature: Vec<u8>, key_id: Option<String>) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
            .to_string();

        Self {
            config,
            signature,
            key_id,
            timestamp,
        }
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns the signature.
    ///
    /// # Returns
    ///
    /// Returns the signature.
    pub fn signature(&self) -> &[u8] {
        &self.signature
    }

    /// Returns the key ID.
    ///
    /// # Returns
    ///
    /// Returns the key ID if present.
    pub fn key_id(&self) -> Option<&str> {
        self.key_id.as_deref()
    }

    /// Returns the timestamp.
    ///
    /// # Returns
    ///
    /// Returns the timestamp.
    pub fn timestamp(&self) -> &str {
        &self.timestamp
    }
}

/// Signs configuration with a key.
///
/// # Arguments
///
/// * `config` - The configuration to sign
/// * `key` - The signing key (32 bytes)
///
/// # Returns
///
/// Returns the signed configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::signing::sign_config;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let key = b"my-signing-key-32-bytes-long-123456";
/// let signed = sign_config(&config, key).unwrap();
/// ```
pub fn sign_config(config: &AppConfig, key: &[u8]) -> ConfigResult<SignedConfig> {
    if key.len() != 32 {
        return Err(ConfigError::ParseError("Key must be 32 bytes".to_string()));
    }

    // Create signature using XOR encryption (simplified for demo)
    let config_json = serde_json::to_string(config)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    let mut signature = Vec::with_capacity(32);
    for (i, byte) in config_json.as_bytes().iter().enumerate() {
        let key_byte = key[i % key.len()];
        signature.push(byte ^ key_byte);
    }

    Ok(SignedConfig::new(
        config.clone(),
        signature,
        Some("default".to_string()),
    ))
}

/// Verifies a signed configuration.
///
/// # Arguments
///
/// * `signed_config` - The signed configuration
/// * `key` - The signing key (32 bytes)
///
/// # Returns
///
/// Returns `Ok(())` if valid, `Err` with error if invalid.
///
/// # Example
///
/// ```no_run
/// use config::utils::signing::{sign_config, verify_config};
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let key = b"my-signing-key-32-bytes-long-123456";
/// let signed = sign_config(&config, key).unwrap();
/// let result = verify_config(&signed, key);
/// ```
pub fn verify_config(signed_config: &SignedConfig, key: &[u8]) -> ConfigResult<()> {
    if key.len() != 32 {
        return Err(ConfigError::ParseError("Key must be 32 bytes".to_string()));
    }

    // Verify signature
    let config_json = serde_json::to_string(&signed_config.config)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    let mut computed_signature = Vec::with_capacity(32);
    for (i, byte) in config_json.as_bytes().iter().enumerate() {
        let key_byte = key[i % key.len()];
        computed_signature.push(byte ^ key_byte);
    }

    if signed_config.signature() != &computed_signature {
        return Err(ConfigError::ParseError("Invalid signature".to_string()));
    }

    Ok(())
}

/// Represents a signing key.
#[derive(Debug, Clone)]
pub struct SigningKey {
    id: String,
    key: Vec<u8>,
}

impl SigningKey {
    /// Creates a new signing key.
    ///
    /// # Arguments
    ///
    /// * `id` - The key ID
    /// * `key` - The 32-byte key
    ///
    /// # Returns
    ///
    /// Returns a new signing key.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::SigningKey;
    ///
    /// let key = SigningKey::new("key1".to_string());
    /// ```
    pub fn new(id: String) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();

        let mut key = Vec::with_capacity(32);
        for i in 0..32 {
            key.push(((timestamp >> (i * 8)) & 0xFF) as u8);
        }

        Self { id, key }
    }

    /// Returns the key ID.
    ///
    /// # Returns
    ///
    /// Returns the ID.
    pub fn id(&self) -> &str {
        &self.id
    }

    /// Returns the key bytes.
    ///
    /// # Returns
    ///
    /// Returns the key.
    pub fn key(&self) -> &[u8] {
        &self.key
    }
}

/// Represents a key store for signing keys.
#[derive(Debug, Clone)]
pub struct KeyStore {
    keys: Vec<SigningKey>,
}

impl KeyStore {
    /// Creates a new key store.
    ///
    /// # Returns
    ///
    /// Returns a new store.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::KeyStore;
    ///
    /// let mut store = KeyStore::new();
    /// ```
    pub fn new() -> Self {
        Self {
            keys: Vec::new(),
        }
    }

    /// Adds a key to the store.
    ///
    /// # Arguments
    ///
    /// * `key` - The key to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::{KeyStore, SigningKey};
    ///
    /// let mut store = KeyStore::new();
    /// let key = SigningKey::new("key1".to_string());
    /// store.add_key(key);
    /// ```
    pub fn add_key(&mut self, key: SigningKey) {
        self.keys.push(key);
    }

    /// Gets a key by ID.
    ///
    /// # Arguments
    ///
    /// * `id` - The key ID
    ///
    /// # Returns
    ///
    /// Returns the key if found.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::KeyStore;
    ///
    /// let store = KeyStore::new();
    /// if let Some(key) = store.get_key("key1") {
    ///     println!("Found key: {}", key.id());
    /// }
    /// ```
    pub fn get_key(&self, id: &str) -> Option<&SigningKey> {
        self.keys.iter().find(|k| k.id() == id)
    }

    /// Removes a key by ID.
    ///
    /// # Arguments
    ///
    /// * `id` - The key ID
    ///
    /// # Returns
    ///
    /// Returns `true` if removed.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::KeyStore;
    ///
    /// let mut store = KeyStore::new();
    /// let key = SigningKey::new("key1".to_string());
    /// store.add_key(key);
    /// let removed = store.remove_key("key1");
    /// assert!(removed);
    /// ```
    pub fn remove_key(&mut self, id: &str) -> bool {
        if let Some(pos) = self.keys.iter().position(|k| k.id() == id) {
            self.keys.remove(pos);
            true
        } else {
            false
        }
    }

    /// Lists all key IDs.
    ///
    /// # Returns
    ///
    /// Returns a list of key IDs.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::KeyStore;
    ///
    /// let store = KeyStore::new();
    /// let ids = store.list_keys();
    /// for id in ids {
    ///     println!("{}", id);
    /// }
    /// ```
    pub fn list_keys(&self) -> Vec<&str> {
        self.keys.iter().map(|k| k.id()).collect()
    }

    /// Returns the number of keys.
    ///
    /// # Returns
    ///
    /// Returns the key count.
    pub fn len(&self) -> usize {
        self.keys.len()
    }

    /// Returns `true` if there are no keys.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.keys.is_empty()
    }

    /// Clears all keys.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::signing::KeyStore;
    ///
    /// let mut store = KeyStore::new();
    /// store.clear();
    /// assert!(store.is_empty());
    /// ```
    pub fn clear(&mut self) {
        self.keys.clear();
    }
}

impl Default for KeyStore {
    fn default() -> Self {
        Self::new()
    }
}

/// Creates a default signing key.
///
/// # Returns
///
/// Returns a new signing key.
///
/// # Example
///
/// ```no_run
/// use config::utils::signing::create_default_key;
///
/// let key = create_default_key();
/// println!("Key ID: {}", key.id());
/// ```
pub fn create_default_key() -> SigningKey {
    SigningKey::new("default".to_string())
}

/// Generates a signing key from a password.
///
/// # Arguments
///
/// * `password` - The password to derive the key from
///
/// # Returns
///
/// Returns a 32-byte signing key.
///
/// # Example
///
/// ```no_run
/// use config::utils::signing::generate_key_from_password;
///
/// let key = generate_key_from_password("my-password");
/// println!("Key: {:?}", key);
/// ```
pub fn generate_key_from_password(password: &str) -> Vec<u8> {
    use std::collections::hash_map::Default;
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    let mut key = Vec::with_capacity(32);
    let mut state = 0u64;

    for (i, byte) in password.as_bytes().iter().enumerate() {
        state = state.wrapping_mul(byte as u64).wrapping_add(timestamp as u64);
        key.push(((state >> (i * 8)) & 0xFF) as u8);
    }

    key
}

/// Represents a signature verification result.
#[derive(Debug, Clone)]
pub struct SignatureVerificationResult {
    is_valid: bool,
    config: AppConfig,
    errors: Vec<String>,
}

impl SignatureVerificationResult {
    /// Creates a new verification result.
    ///
    /// # Arguments
    ///
    /// * `is_valid` - Whether the signature is valid
    /// * `config` - The configuration
    /// * `errors` - List of errors
    ///
    /// # Returns
    ///
    /// Returns a new result.
    pub fn new(is_valid: bool, config: AppConfig, errors: Vec<String>) -> Self {
        Self {
            is_valid,
            config,
            errors,
        }
    }

    /// Returns `true` if the signature is valid.
    ///
    /// # Returns
    ///
    /// Returns `true` if valid.
    pub fn is_valid(&self) -> bool {
        self.is_valid
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns the errors.
    ///
    /// # Returns
    ///
    /// Returns the errors.
    pub fn errors(&self) -> &[String] {
        &self.errors
    }

    /// Returns `true` if there are no errors.
    ///
    /// # Returns
    /// Returns `true` if no errors.
    pub fn has_errors(&self) -> bool {
        !self.errors.is_empty()
    }
}

/// Verifies a signed configuration and returns detailed result.
///
/// # Arguments
///
/// * `signed_config` - The signed configuration
/// * `key` - The signing key
///
/// # Returns
///
/// /// Returns the verification result.
///
/// # Example
///
/// ```no_run
/// use config::utils::signing::{sign_config, verify_config_detailed};
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let key = b"my-signing-key-32-bytes-long-123456";
/// let signed = sign_config(&config, key).unwrap();
/// let result = verify_config_detailed(&signed, key);
/// println!("Valid: {}", result.is_valid());
/// ```
pub fn verify_config_detailed(
    signed_config: &SignedConfig,
    key: &[u8],
) -> SignatureVerificationResult {
    let mut errors = Vec::new();

    // Check key length
    if key.len() != 32 {
        errors.push("Key must be 32 bytes".to_string());
    }

    // Verify signature
    let config_json = match serde_json::to_string(&signed_config.config) {
        Ok(json) => json,
        Err(e) => {
            errors.push(format!("Failed to serialize config: {}", e));
            return SignatureVerificationResult::new(
                false,
                signed_config.config.clone(),
                errors,
            );
        }
    };

    let mut computed_signature = Vec::with_capacity(32);
    for (i, byte) in config_json.as_bytes().iter().enumerate() {
        let key_byte = key[i % key.len()];
        computed_signature.push(byte ^ key_byte);
    }

    if signed_config.signature() != &computed_signature {
        errors.push("Signature mismatch".to_string());
    }

    let is_valid = !errors.is_empty();

    SignatureVerificationResult::new(
        is_valid,
        signed_config.config.clone(),
        errors,
    )
}

/// Signs a configuration file.
///
/// # Arguments
///
/// * `config_path` - The path to the config file
/// * `key` - The signing key (32 bytes)
///
/// # Returns
///
    /// Returns `Ok(())` on success.
///
    /// # Example
///
/// ```no_run
/// use config::utils::signing::sign_config_file;
/// use config::types::AppConfig;
///
    /// let config = AppConfig::default();
    /// let key = b"my-signing-key-32-bytes-long-123456";
    /// sign_config_file("Config.toml", &config, key).unwrap();
    /// ```
pub fn sign_config_file<P: AsRef<Path>>(
    config_path: P,
    config: &AppConfig,
    key: &[u8],
) -> ConfigResult<()> {
    let signed = sign_config(config, key)?;

    // Save signed config with signature
    let signed_json = serde_json::to_string_pretty(&signed_config)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    std::fs::write(config_path, signed_json)?;

    Ok(())
}

/// Verifies a signed configuration file.
///
/// # Arguments
///
/// * `config_path` - The path to the signed config file
/// * `key` - The signing key (32 bytes)
///
/// # Returns
///
    /// Returns `Ok(())` if valid, `Err` with error if invalid.
///
    /// # Example
///
/// ```no_run
/// use config::utils::signing::verify_config_file;
///
/// let key = b"my-signing-key-32-bytes-long-123456";
/// let result = verify_config_file("signed-config.json", key);
/// ```
pub fn verify_config_file<P: AsRef<Path>>(
    config_path: P,
    key: &[u8],
) -> ConfigResult<()> {
    let content = std::fs::read_to_string(config_path)?;
    let signed_config: SignedConfig = serde_json::from_str(&content)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    verify_config(&signed_config, key)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sign_config() {
        let config = AppConfig::default();
        let key = b"my-signing-key-32-bytes-long-123456";
        let signed = sign_config(&config, key).unwrap();
        assert_eq!(signed.config().appearance.theme_id, "default-dark");
    }

    #[test]
    fn test_sign_config_invalid_key() {
        let config = AppConfig::default();
        let key = b"short-key"; // Not 32 bytes
        let result = sign_config(&config, key);
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_config() {
        let config = AppConfig::default();
        let key = b"my-signing-key-32-bytes-long-123456";
        let signed = sign_config(&config, key).unwrap();
        let result = verify_config(&signed, key);
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_config_invalid() {
        let config = AppConfig::default();
        let key = b"my-signing-key-32-bytes-long-123456";
        let mut signed = sign_config(&config, key).unwrap();
        signed.signature = vec![0u8; 32]; // Corrupt signature
        let result = verify_config(&signed, key);
        assert!(result.is_err());
    }

    #[test]
    fn test_signing_key() {
        let key = SigningKey::new("test".to_string());
        assert_eq!(key.id(), "test");
        assert_eq!(key.key().len(), 32);
    }

    #[test]
    fn test_key_store() {
        let mut store = KeyStore::new();
        let key = SigningKey::new("key1".to_string());
        store.add_key(key);
        assert_eq!(store.len(), 1);
        assert!(store.get_key("key1").is_some());
    }

    #[test]
    fn test_key_store_remove() {
        let mut store = KeyStore::new();
        let key = SigningKey::new("key1".to_string());
        store.add_key(key);
        assert!(store.remove_key("key1"));
        assert!(store.is_empty());
    }

    #[test]
 fn test_generate_key_from_password() {
        let key = generate_key_from_password("my-password");
        assert_eq!(key.len(), 32);
    }

    #[test]
fn test_signature_verification_result() {
        let config = AppConfig::default();
        let errors = vec
!["error1".to_string(), "error2".to_string()];
        let result = SignatureVerificationResult::new(
            true,
            config,
            errors,
        );
        assert!(result.is_valid());
        assert!(result.has_errors());
    }
}
