use serde::{Deserialize, Serialize};

use super::error::ConfigError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigVersion {
    pub major: u32,
    pub minor: u32,
    pub patch: u32,
}

impl Default for ConfigVersion {
    fn default() -> Self {
        Self {
            major: 1,
            minor: 0,
            patch: 0,
        }
    }
}

impl ConfigVersion {
    pub fn new(major: u32, minor: u32, patch: u32) -> Self {
        Self {
            major,
            minor,
            patch,
        }
    }

    pub fn as_string(&self) -> String {
        format!("{}.{}.{}", self.major, self.minor, self.patch)
    }

    pub fn from_string(s: &str) -> Result<Self, ConfigError> {
        let parts: Vec<&str> = s.split('.').collect();
        if parts.len() != 3 {
            return Err(ConfigError::ParseError(format!(
                "Invalid version format: {}",
                s
            )));
        }
        Ok(Self {
            major: parts[0]
                .parse()
                .map_err(|_| ConfigError::ParseError(format!("Invalid major version: {}", parts[0])))?,
            minor: parts[1]
                .parse()
                .map_err(|_| ConfigError::ParseError(format!("Invalid minor version: {}", parts[1])))?,
            patch: parts[2]
                .parse()
                .map_err(|_| ConfigError::ParseError(format!("Invalid patch version: {}", parts[2])))?,
        })
    }

    pub fn is_compatible_with(&self, other: &ConfigVersion) -> bool {
        self.major == other.major
    }
}
