//! Authentication Service
//!
//! Business logic สำหรับการจัดการ authentication และ authorization

use crate::config::Config;
use crate::error::{ApiError, ApiResult};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub struct AuthService {
    config: Config,
}

impl AuthService {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub fn generate_token(&self, user_id: &str) -> ApiResult<String> {
        let expiration = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| ApiError::internal(format!("Time error: {}", e)))?
            .as_secs() as usize
            + self.config.jwt.expiration_secs as usize;

        let claims = Claims {
            sub: user_id.to_string(),
            exp: expiration,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.config.jwt.secret.as_ref()),
        )
        .map_err(|e| ApiError::internal(format!("Token generation failed: {}", e)))?;

        Ok(token)
    }

    pub fn verify_token(&self, token: &str) -> ApiResult<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.config.jwt.secret.as_ref()),
            &Validation::default(),
        )
        .map_err(|e| ApiError::unauthorized(format!("Invalid token: {}", e)))?;

        Ok(token_data.claims)
    }
}
