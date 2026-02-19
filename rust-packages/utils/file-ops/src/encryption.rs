//! Provides functions for file encryption and decryption using AES-256-GCM.

use crate::error::{Error, Result};
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm,
    Key,
    Nonce,
};
use camino::Utf8Path;
use std::fs;

/// Encrypts a file using AES-256-GCM.
///
/// The nonce is randomly generated and prepended to the ciphertext.
///
/// # Arguments
///
/// * `from` - The path to the plaintext file.
/// * `to` - The path to write the encrypted file.
/// * `key` - A 32-byte key.
///
/// # Example
///
/// ```no_run
/// use file_ops::encrypt;
/// use camino::Utf8Path;
///
/// let key = [42; 32];
/// let from = Utf8Path::new("plaintext.txt");
/// let to = Utf8Path::new("encrypted.bin");
/// encrypt(from, to, &key).unwrap();
/// ```
pub fn encrypt(from: &Utf8Path, to: &Utf8Path, key: &[u8; 32]) -> Result<()> {
    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let plaintext = fs::read(from)?;
    let ciphertext = cipher.encrypt(&nonce, plaintext.as_ref()).map_err(|e| Error::Encryption(e.to_string()))?;

    let mut encrypted_data = nonce.to_vec();
    encrypted_data.extend_from_slice(&ciphertext);

    fs::write(to, encrypted_data)?;

    Ok(())
}

/// Decrypts a file using AES-256-GCM.
///
/// The nonce is read from the beginning of the ciphertext.
///
/// # Arguments
///
/// * `from` - The path to the encrypted file.
/// * `to` - The path to write the decrypted file.
/// * `key` - A 32-byte key.
///
/// # Example
///
/// ```no_run
/// use file_ops::decrypt;
/// use camino::Utf8Path;
///
/// let key = [42; 32];
/// let from = Utf8Path::new("encrypted.bin");
/// let to = Utf8Path::new("decrypted.txt");
/// decrypt(from, to, &key).unwrap();
/// ```
pub fn decrypt(from: &Utf8Path, to: &Utf8Path, key: &[u8; 32]) -> Result<()> {
    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(key);

    let encrypted_data = fs::read(from)?;
    if encrypted_data.len() < 12 {
        return Err(Error::Decryption("Invalid encrypted file format".to_string()));
    }

    let (nonce_data, ciphertext) = encrypted_data.split_at(12);
    let nonce = Nonce::from_slice(nonce_data);

    let plaintext = cipher.decrypt(nonce, ciphertext).map_err(|e| Error::Decryption(e.to_string()))?;

    fs::write(to, plaintext)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_encrypt_decrypt_roundtrip() -> Result<()> {
        let dir = tempdir()?;
        let from_path = Utf8Path::from_path(dir.path()).unwrap().join("plaintext.txt");
        let encrypted_path = Utf8Path::from_path(dir.path()).unwrap().join("encrypted.bin");
        let to_path = Utf8Path::from_path(dir.path()).unwrap().join("decrypted.txt");

        let key = [42; 32];
        let content = b"super secret message";
        fs::write(&from_path, content)?;

        encrypt(&from_path, &encrypted_path, &key)?;
        decrypt(&encrypted_path, &to_path, &key)?;

        let decrypted_content = fs::read(&to_path)?;
        assert_eq!(content, decrypted_content.as_slice());

        Ok(())
    }
}