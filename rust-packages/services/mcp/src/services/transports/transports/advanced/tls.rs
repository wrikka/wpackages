use std::path::PathBuf;
use tracing::{debug, warn};

#[derive(Debug, Clone)]
pub struct CertificateConfig {
    pub cert_path: Option<PathBuf>,
    pub key_path: Option<PathBuf>,
    pub ca_path: Option<PathBuf>,
}

#[derive(Debug, Clone)]
pub struct TlsConfig {
    pub enabled: bool,
    pub mtls_enabled: bool,
    pub verify_certificate: bool,
    pub certificate: CertificateConfig,
}

impl Default for TlsConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            mtls_enabled: false,
            verify_certificate: true,
            certificate: CertificateConfig {
                cert_path: None,
                key_path: None,
                ca_path: None,
            },
        }
    }
}

pub struct TlsLayer {
    config: TlsConfig,
}

impl TlsLayer {
    pub fn new(config: TlsConfig) -> Self {
        Self { config }
    }

    pub async fn setup(&self) -> Result<(), String> {
        if !self.config.enabled {
            debug!("TLS not enabled, skipping setup");
            return Ok(());
        }

        debug!("Setting up TLS layer");

        if self.config.mtls_enabled {
            debug!("mTLS enabled");
        }

        if let Some(ref cert_path) = self.config.certificate.cert_path {
            debug!("Loading certificate from: {:?}", cert_path);
        }

        Ok(())
    }

    pub fn is_enabled(&self) -> bool {
        self.config.enabled
    }

    pub fn is_mtls_enabled(&self) -> bool {
        self.config.mtls_enabled
    }

    pub fn config(&self) -> &TlsConfig {
        &self.config
    }
}
