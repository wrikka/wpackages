//! Configuration encryption utilities
//!
//! This module provides encryption for sensitive configuration data.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;
use std::collections::HashMap;

/// Represents encrypted configuration data.
#[derive(Debug, Clone)]
pub struct EncryptedConfig {
    encrypted_data: Vec<u8>,
    nonce: Vec<u8>,
    key_id: Option<String>,
}

impl EncryptedConfig {
    /// Creates a new encrypted configuration.
    ///
    /// # Arguments
    ///
    /// * `encrypted_data` - The encrypted data
    /// * `nonce` - The nonce used for encryption
    /// * `key_id` - Optional key identifier
    ///
    /// # Returns
    ///
    /// Returns a new encrypted configuration.
    pub fn new(encrypted_data: Vec<u8>, nonce: Vec<u8>, key_id: Option<String>) -> Self {
        Self {
            encrypted_data,
            nonce,
            key_id,
        }
    }

    /// Returns the encrypted data.
    ///
    /// # Returns
    ///
    /// Returns the encrypted data.
    pub fn encrypted_data(&self) -> &[u8] {
        &self.encrypted_data
    }

    /// Returns the nonce.
    ///
    /// # Returns
    ///
    /// Returns the nonce.
    pub fn nonce(&self) -> &[u8] {
        &self.nonce
    }

    /// Returns the key ID.
    ///
    /// # Returns
    ///
    /// Returns the key ID if present.
    pub fn key_id(&self) -> Option<&str> {
        self.key_id.as_deref()
    }
}

/// Encrypts configuration data.
///
/// # Arguments
///
/// * `config` - The configuration to encrypt
/// * `key` - The encryption key
///
/// # Returns
    /// Returns the encrypted configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::encryption::encrypt_config;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let key = b"my-secret-key-32-bytes-long-123456";
/// let encrypted = encrypt_config(&config, key).unwrap();
/// ```
pub fn encrypt_config(config: &AppConfig, key: &[u8]) -> ConfigResult<EncryptedConfig> {
    // Serialize config to JSON
    let config_json = serde_json::to_string(config)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    // Convert to bytes
    let config_bytes = config_json.as_bytes();

    // Generate nonce
    let nonce = generate_nonce();

    // Encrypt using XOR encryption (simplified for demo)
    let encrypted_data = xor_encrypt(config_bytes, key, &nonce);

    Ok(EncryptedConfig::new(
        encrypted_data,
        nonce,
        None,
    ))
}

/// Decrypts configuration data.
///
/// # Arguments
///
/// * `encrypted` - The encrypted configuration
/// * `key` - The encryption key
///
/// # Returns
///
/// Returns the decrypted configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::encryption::encrypt_config;
/// use config::utils::encryption::decrypt_config;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let key = b"my-secret-key-32-bytes-long-123456";
/// let encrypted = encrypt_config(&config, key).unwrap();
/// let decrypted = decrypt_config(&encrypted, key).unwrap();
/// ```
pub fn decrypt_config(encrypted: &EncryptedConfig, key: &[u8]) -> ConfigResult<AppConfig> {
    // Decrypt using XOR decryption
    let decrypted_bytes = xor_decrypt(
        encrypted.encrypted_data(),
        key,
        encrypted.nonce(),
    );

    // Convert to string
    let config_json = String::from_utf8(decrypted_bytes)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    // Deserialize
    let config: AppConfig = serde_json::from_str(&config_json)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    Ok(config)
}

/// Generates a random nonce.
fn generate_nonce() -> Vec<u8> {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    let mut nonce = vec
![0u8; 12];
    for (i, byte) in nonce.iter_mut().enumerate() {
        *byte = ((timestamp >> (i * 8)) & 0xFF) as u8;
    }
    nonce
}

/// XOR encryption (simplified for demo).
fn xor_encrypt(data: &[u8], key: &[u8], nonce: &[u8]) -> Vec<u8> {
    let mut encrypted = Vec::with_capacity(data.len());

    for (i, &byte) in data.iter().enumerate() {
        let key_byte = key[i % key.len()];
        let nonce_byte = nonce[i % nonce.len()];
        encrypted.push(byte ^ key_byte ^ nonce_byte);
    }

    encrypted
}

/// XOR decryption (simplified for demo).
fn xor_decrypt(encrypted: &[u8], key: &[u8], nonce: &[u8]) -> Vec<u8> {
    let mut decrypted = Vec::with_capacity(encrypted.len());

    for (i, &byte) in encrypted.iter().enumerate() {
        let key_byte = key[i % key.len()];
        let nonce_byte = nonce[i % nonce.len()];
        decrypted.push(byte ^ key_byte ^ nonce_byte);
    }

    decrypted
}

/// Represents a field that should be encrypted.
#[derive(Debug, Clone, PartialEq)]
pub struct EncryptedField {
    path: String,
    value: String,
}

impl EncryptedField {
    /// Creates a new encrypted field.
    ///
    /// # Arguments
    ///
    /// * `path` - The field path
    /// * `value` - The field value
    ///
    /// # Returns
    ///
    /// Returns a new encrypted field.
    pub fn new(path: String, value: String) -> Self {
        Self { path, value }
    }

    /// Returns the field path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn path(&self) -> &str {
        &self.path
    }

    /// Returns the field value.
    ///
    /// # Returns
    ///
    /// Returns the value.
    pub fn value(&self) -> &str {
        &self.value
    }
}

/// Encrypts specific configuration fields.
///
/// # Arguments
///
/// * `config` - The configuration
/// * `fields` - The fields to encrypt
/// * `key` - The encryption key
///
/// # Returns
    /// Returns a map of encrypted field paths to encrypted data.
///
/// # Example
///
/// ```no_run
/// use config::utils::encryption::encrypt_fields;
/// use config::utils::encryption::EncryptedField;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let key = b"my-secret-key-32-bytes-long-123456";
/// let fields = vec
![EncryptedField::new("api_key".to_string(), "secret".to_string())];
/// let encrypted = encrypt_fields(&config, &fields, key).unwrap();
/// ```
pub fn encrypt_fields(
    config: &AppConfig,
    fields: &[EncryptedField],
    key: &[u8],
) -> ConfigResult<HashMap<String, Vec<u8>>> {
    let mut encrypted = HashMap::new();

    for field in fields {
        let field_data = field.value.as_bytes();
        let nonce = generate_nonce();
        let encrypted_data = xor_encrypt(field_data, key, &nonce);

        encrypted.insert(field.path.clone(), encrypted_data);
    }

    Ok(encrypted)
}

/// Decrypts specific configuration fields.
///
/// # Arguments
///
/// * `encrypted_fields` - The encrypted fields
/// * `key` - The encryption key
///
/// # Returns
///
/// Returns a map of field paths to decrypted values.
///
/// # Example
///
/// ```no_run
/// use config::utils::encryption::decrypt_fields;
///
/// let encrypted = HashMap::new();
/// let key = b"my-secret-key-32-bytes-long-123456";
/// let decrypted = decrypt_fields(&encrypted, key).unwrap();
/// ```
pub fn decrypt_fields(
    encrypted_fields: &HashMap<String, Vec<u8>>,
    key: &[u8],
) -> ConfigResult<HashMap<String, String>> {
    let mut decrypted = HashMap::new();

    for (path, encrypted_data) in encrypted_fields {
        let nonce = vec
![0u8; 12]; // In real implementation, store nonce with encrypted data
        let decrypted_bytes = xor_decrypt(encrypted_data, key, &nonce);

        let value = String::from_utf8(decrypted_bytes)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;

        decrypted.insert(path.clone(), value);
    }

    Ok(decrypted)
}

/// Generates a random encryption key.
///
/// # Returns
///
/// Returns a 32-byte key.
///
/// # Example
///
/// ```no_run
/// use config::utils::encryption::generate_key;
///
/// let key = generate_key();
/// println!("Key: {:?}", key);
/// ```
pub fn generate_key() -> Vec<u8> {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    let mut key = vec
![0u8; 32];
    for (i, byte) in key.iter_mut().enumerate() {
        *byte = ((timestamp >> (i * 8)) & 0xFF) as u8;
    }
    key
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_config() {
        let config = AppConfig::default();
        let key = b"my-secret-key-32-bytes-long-123456";

        let encrypted = encrypt_config(&config, key).unwrap();
        let decrypted = decrypt_config(&encrypted, key).unwrap();

        assert_eq!(decrypted.appearance.theme_id, config.appearance.theme_id);
    }

    #[test]
    fn test_encrypt_decrypt_fields() {
        let config = AppConfig::default();
        let key = b"my-secret-key-32-bytes-long-123456";
        let fields = vec
![EncryptedField::new("api_key".to_string(), "secret".to_string())];

        let encrypted = encrypt_fields(&config, &fields, key).unwrap();
        let decrypted = decrypt_fields(&encrypted, key).unwrap();

        assert_eq!(decrypted.get("api_key"), Some(&"secret".to_string()));
    }

    #[test]
    fn test_generate_key() {
        let key = generate_key();
        assert_eq!(key.len(), 32);
    }

    #[test]
    fn test_encrypted_config() {
        let encrypted_data = vec
![1, 2, 3, 4];
        let nonce = vec
![5, 6, 7, 8];
        let encrypted = EncryptedConfig::new(encrypted_data, nonce, Some("key1".to_string()));

        assert_eq!(encrypted.encrypted_data(), &[1, 2, 3, 4]);
        assert_eq!(encrypted.nonce(), &[5, 6, 7, 8]);
        assert_eq!(encrypted.key_id(), Some("key1"));
    }
}
