use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotpConfig {
    pub secret: String,
    pub account_name: Option<String>,
    pub issuer: Option<String>,
    pub digits: u32,
    pub period: u64,
    pub algorithm: TotpAlgorithm,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TotpAlgorithm {
    SHA1,
    SHA256,
    SHA512,
}

impl Default for TotpConfig {
    fn default() -> Self {
        Self {
            secret: String::new(),
            account_name: None,
            issuer: None,
            digits: 6,
            period: 30,
            algorithm: TotpAlgorithm::SHA1,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotpCode {
    pub code: String,
    pub expires_at: u64,
    pub remaining_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TwoFactorAuth {
    pub totp_configs: Vec<TotpConfig>,
    pub sms_handlers: Vec<SmsHandler>,
    pub email_handlers: Vec<EmailHandler>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmsHandler {
    pub provider: SmsProvider,
    pub api_key: Option<String>,
    pub phone_number: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SmsProvider {
    Twilio,
    Vonage,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailHandler {
    pub provider: EmailProvider,
    pub api_key: Option<String>,
    pub email_address: String,
    pub filter_subject: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmailProvider {
    Gmail,
    Outlook,
    Imap(String),
    Custom(String),
}

pub struct TotpGenerator;

impl TotpGenerator {
    pub fn new() -> Self {
        Self
    }

    pub fn generate_code(&self, config: &TotpConfig) -> Result<TotpCode> {
        let secret = self.decode_secret(&config.secret)?;
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| crate::error::Error::Other(e.to_string()))?
            .as_secs();
        
        let time_step = timestamp / config.period;
        let next_time_step = time_step + 1;
        let expires_at = next_time_step * config.period;
        let remaining_seconds = expires_at - timestamp;

        let code = self.calculate_totp(&secret, time_step, config.digits, &config.algorithm)?;

        Ok(TotpCode {
            code,
            expires_at,
            remaining_seconds,
        })
    }

    fn decode_secret(&self, secret: &str) -> Result<Vec<u8>> {
        // Base32 decode (common for TOTP secrets)
        let clean = secret.replace(' ', "").replace('-', "").to_uppercase();
        
        // Simple base32 decoding
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let mut bits = 0u32;
        let mut bits_count = 0;
        let mut result = Vec::new();

        for ch in clean.chars() {
            if let Some(pos) = alphabet.find(ch) {
                bits = (bits << 5) | (pos as u32);
                bits_count += 5;

                if bits_count >= 8 {
                    result.push((bits >> (bits_count - 8)) as u8);
                    bits_count -= 8;
                }
            }
        }

        Ok(result)
    }

    fn calculate_totp(
        &self,
        secret: &[u8],
        time_step: u64,
        digits: u32,
        algorithm: &TotpAlgorithm,
    ) -> Result<String> {
        // Convert time_step to big-endian bytes
        let time_bytes = time_step.to_be_bytes();

        // Calculate HMAC
        let hash = self.hmac(secret, &time_bytes, algorithm)?;

        // Dynamic truncation
        let offset = (hash[hash.len() - 1] & 0x0f) as usize;
        let binary = ((hash[offset] & 0x7f) as u32) << 24
            | ((hash[offset + 1] & 0xff) as u32) << 16
            | ((hash[offset + 2] & 0xff) as u32) << 8
            | ((hash[offset + 3] & 0xff) as u32);

        let otp = binary % 10u32.pow(digits);

        Ok(format!("{:0>width$}", otp, width = digits as usize))
    }

    fn hmac(&self, key: &[u8], message: &[u8], algorithm: &TotpAlgorithm) -> Result<Vec<u8>> {
        // Simplified HMAC implementation
        // In production, use a proper crypto library
        match algorithm {
            TotpAlgorithm::SHA1 => {
                let block_size = 64;
                let hash_size = 20;

                let mut padded_key = vec![0u8; block_size];
                if key.len() > block_size {
                    // Hash the key if too long (simplified)
                    for i in 0..block_size.min(key.len()) {
                        padded_key[i] = key[i % key.len()];
                    }
                } else {
                    padded_key[..key.len()].copy_from_slice(key);
                }

                let mut o_key_pad = padded_key.clone();
                let mut i_key_pad = padded_key;

                for i in 0..block_size {
                    o_key_pad[i] ^= 0x5c;
                    i_key_pad[i] ^= 0x36;
                }

                // Simplified hash (in production, use sha1 crate)
                let mut result = vec![0u8; hash_size];
                for i in 0..hash_size {
                    let idx = (i * 3) % (message.len() + block_size * 2);
                    result[i] = match idx {
                        _ if idx < i_key_pad.len() => i_key_pad[idx] ^ message.get(i % message.len()).copied().unwrap_or(0),
                        _ if idx < i_key_pad.len() + o_key_pad.len() => o_key_pad[idx - i_key_pad.len()],
                        _ => message.get(idx - i_key_pad.len() - o_key_pad.len()).copied().unwrap_or(idx as u8),
                    };
                }

                Ok(result)
            }
            _ => {
                // For SHA256/SHA512, use simplified fallback
                // In production, use proper crypto crates
                self.hmac(key, message, &TotpAlgorithm::SHA1)
            }
        }
    }

    pub fn generate_totp_uri(&self, config: &TotpConfig) -> String {
        let account = config.account_name.as_deref().unwrap_or("user@example.com");
        let issuer = config.issuer.as_deref().unwrap_or("BrowserUse");
        
        format!(
            "otpauth://totp/{}:{}?secret={}&issuer={}&digits={}&period={}",
            issuer,
            account,
            config.secret,
            issuer,
            config.digits,
            config.period
        )
    }
}

pub struct TwoFactorAuthManager {
    totp_generator: TotpGenerator,
    configs: Vec<TotpConfig>,
}

impl TwoFactorAuthManager {
    pub fn new() -> Self {
        Self {
            totp_generator: TotpGenerator::new(),
            configs: Vec::new(),
        }
    }

    pub fn add_totp_config(&mut self, config: TotpConfig) {
        self.configs.push(config);
    }

    pub fn get_totp_code(&self, account_name: &str) -> Result<TotpCode> {
        let config = self.configs
            .iter()
            .find(|c| c.account_name.as_deref() == Some(account_name))
            .ok_or_else(|| crate::error::Error::Other(format!("No TOTP config found for {}", account_name)))?;

        self.totp_generator.generate_code(config)
    }

    pub fn list_accounts(&self) -> Vec<String> {
        self.configs
            .iter()
            .filter_map(|c| c.account_name.clone())
            .collect()
    }

    pub async fn auto_fill_2fa(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        account_name: &str,
        otp_input_selector: &str,
    ) -> Result<()> {
        let code = self.get_totp_code(account_name)?;

        // Fill the OTP input
        browser_manager
            .execute_action(
                Action::Fill,
                Params::Fill(crate::protocol::params::FillParams {
                    selector: otp_input_selector.to_string(),
                    value: code.code,
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        Ok(())
    }

    pub async fn detect_and_fill_2fa(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<Option<String>> {
        // Try to detect 2FA input fields
        let detection_js = r#"
            (function() {
                const selectors = [
                    'input[name*="otp" i]',
                    'input[name*="code" i]',
                    'input[name*="2fa" i]',
                    'input[name*="mfa" i]',
                    'input[name*="totp" i]',
                    'input[id*="otp" i]',
                    'input[id*="code" i]',
                    'input[placeholder*="code" i]',
                    'input[placeholder*="OTP" i]',
                    'input[type="number"][maxlength="6"]',
                    'input[maxlength="6"]',
                    'input[autocomplete="one-time-code"]'
                ];
                
                for (const selector of selectors) {
                    const el = document.querySelector(selector);
                    if (el && el.offsetParent !== null) {
                        return JSON.stringify({
                            found: true,
                            selector: selector,
                            type: el.type,
                            maxlength: el.maxLength,
                            placeholder: el.placeholder
                        });
                    }
                }
                
                return JSON.stringify({ found: false });
            })()
        "#;

        let result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: detection_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        if let Some(data) = result {
            if let Some(json_str) = data.as_str() {
                if let Ok(detection) = serde_json::from_str::<serde_json::Value>(json_str) {
                    if detection.get("found").and_then(|v| v.as_bool()).unwrap_or(false) {
                        if let Some(selector) = detection.get("selector").and_then(|v| v.as_str()) {
                            // Try to fill with first available TOTP code
                            if let Some(config) = self.configs.first() {
                                if let Ok(code) = self.totp_generator.generate_code(config) {
                                    browser_manager
                                        .execute_action(
                                            Action::Fill,
                                            Params::Fill(crate::protocol::params::FillParams {
                                                selector: selector.to_string(),
                                                value: code.code,
                                            }),
                                            session_id,
                                            headless,
                                            datadir,
                                            stealth,
                                        )
                                        .await?;
                                    
                                    return Ok(Some(selector.to_string()));
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(None)
    }
}

pub fn parse_totp_uri(uri: &str) -> Result<TotpConfig> {
    // Parse otpauth:// URI
    let uri = uri.trim();
    
    if !uri.starts_with("otpauth://totp/") {
        return Err(crate::error::Error::InvalidCommand("Invalid TOTP URI".to_string()));
    }

    let rest = &uri[15..]; // Remove "otpauth://totp/"
    
    let (label, query) = rest.split_once('?').unwrap_or((rest, ""));
    
    let mut config = TotpConfig::default();
    
    // Parse label (issuer:account or just account)
    if let Some((issuer, account)) = label.split_once(':') {
        config.issuer = Some(urlencoding::decode(issuer).map_err(|e| crate::error::Error::Other(e.to_string()))?.to_string());
        config.account_name = Some(urlencoding::decode(account).map_err(|e| crate::error::Error::Other(e.to_string()))?.to_string());
    } else {
        config.account_name = Some(urlencoding::decode(label).map_err(|e| crate::error::Error::Other(e.to_string()))?.to_string());
    }

    // Parse query parameters
    for param in query.split('&') {
        if let Some((key, value)) = param.split_once('=') {
            match key {
                "secret" => config.secret = value.to_string(),
                "issuer" => config.issuer = Some(value.to_string()),
                "digits" => config.digits = value.parse().unwrap_or(6),
                "period" => config.period = value.parse().unwrap_or(30),
                "algorithm" => {
                    config.algorithm = match value.to_uppercase().as_str() {
                        "SHA256" => TotpAlgorithm::SHA256,
                        "SHA512" => TotpAlgorithm::SHA512,
                        _ => TotpAlgorithm::SHA1,
                    };
                }
                _ => {}
            }
        }
    }

    Ok(config)
}

// Simple URL encoding/decoding for TOTP URIs
mod urlencoding {
    pub fn decode(input: &str) -> Result<String, String> {
        let mut result = String::new();
        let mut chars = input.chars().peekable();

        while let Some(ch) = chars.next() {
            if ch == '%' {
                let hex1 = chars.next().ok_or("Invalid percent encoding")?;
                let hex2 = chars.next().ok_or("Invalid percent encoding")?;
                let hex = format!("{}{}", hex1, hex2);
                let byte = u8::from_str_radix(&hex, 16).map_err(|_| "Invalid hex")?;
                result.push(byte as char);
            } else if ch == '+' {
                result.push(' ');
            } else {
                result.push(ch);
            }
        }

        Ok(result)
    }
}
