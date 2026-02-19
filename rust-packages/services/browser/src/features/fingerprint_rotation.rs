use rand::seq::SliceRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserFingerprint {
    pub user_agent: String,
    pub accept_language: String,
    pub screen_resolution: (u32, u32),
    pub color_depth: u8,
    pub timezone: String,
    pub platform: String,
    pub plugins: Vec<String>,
    pub fonts: Vec<String>,
    pub canvas_noise: f64,
    pub webgl_vendor: String,
    pub webgl_renderer: String,
}

#[derive(Debug, Clone)]
pub struct FingerprintRotator {
    fingerprints: Vec<BrowserFingerprint>,
    current_index: usize,
    rotation_strategy: RotationStrategy,
}

#[derive(Debug, Clone)]
pub enum RotationStrategy {
    Random,
    Sequential,
    Weighted(Vec<f64>),
}

impl FingerprintRotator {
    pub fn new(fingerprints: Vec<BrowserFingerprint>, strategy: RotationStrategy) -> Self {
        Self {
            fingerprints,
            current_index: 0,
            rotation_strategy: strategy,
        }
    }

    pub fn with_default_fingerprints() -> Self {
        let fingerprints = vec![
            BrowserFingerprint {
                user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
                accept_language: "en-US,en;q=0.9".to_string(),
                screen_resolution: (1920, 1080),
                color_depth: 24,
                timezone: "America/New_York".to_string(),
                platform: "Win32".to_string(),
                plugins: vec!["Chrome PDF Plugin".to_string()],
                fonts: vec!["Arial".to_string(), "Times New Roman".to_string()],
                canvas_noise: 0.0,
                webgl_vendor: "Google Inc. (NVIDIA)".to_string(),
                webgl_renderer: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Direct3D11 vs_5_0 ps_5_0, D3D11)".to_string(),
            },
            BrowserFingerprint {
                user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
                accept_language: "en-GB,en;q=0.9".to_string(),
                screen_resolution: (2560, 1440),
                color_depth: 30,
                timezone: "Europe/London".to_string(),
                platform: "MacIntel".to_string(),
                plugins: vec!["Chrome PDF Plugin".to_string()],
                fonts: vec!["Helvetica".to_string(), "Courier".to_string()],
                canvas_noise: 0.0,
                webgl_vendor: "Apple Inc.".to_string(),
                webgl_renderer: "Apple M1".to_string(),
            },
            BrowserFingerprint {
                user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
                accept_language: "en-US,en;q=0.9,de;q=0.8".to_string(),
                screen_resolution: (1920, 1080),
                color_depth: 24,
                timezone: "Europe/Berlin".to_string(),
                platform: "Linux x86_64".to_string(),
                plugins: vec!["Chrome PDF Plugin".to_string()],
                fonts: vec!["DejaVu Sans".to_string(), "Liberation Serif".to_string()],
                canvas_noise: 0.0,
                webgl_vendor: "X.Org".to_string(),
                webgl_renderer: "AMD Radeon".to_string(),
            },
        ];

        Self::new(fingerprints, RotationStrategy::Random)
    }

    pub fn get_next_fingerprint(&mut self) -> Option<BrowserFingerprint> {
        match self.rotation_strategy {
            RotationStrategy::Random => {
                let mut rng = rand::rng();
                self.fingerprints.choose(&mut rng).cloned()
            }
            RotationStrategy::Sequential => {
                if self.fingerprints.is_empty() {
                    return None;
                }
                let fp = self.fingerprints[self.current_index].clone();
                self.current_index = (self.current_index + 1) % self.fingerprints.len();
                Some(fp)
            }
            RotationStrategy::Weighted(ref weights) => {
                if weights.len() != self.fingerprints.len() {
                    let mut rng = rand::rng();
                    return self.fingerprints.choose(&mut rng).cloned();
                }
                let total: f64 = weights.iter().sum();
                let mut rng = rand::random::<f64>() * total;
                
                for (i, weight) in weights.iter().enumerate() {
                    rng -= weight;
                    if rng <= 0.0 {
                        return Some(self.fingerprints[i].clone());
                    }
                }
                self.fingerprints.last().cloned()
            }
        }
    }

    pub fn get_fingerprint(&self, index: usize) -> Option<BrowserFingerprint> {
        self.fingerprints.get(index).cloned()
    }

    pub fn add_fingerprint(&mut self, fingerprint: BrowserFingerprint) {
        self.fingerprints.push(fingerprint);
    }

    pub fn remove_fingerprint(&mut self, index: usize) -> Option<BrowserFingerprint> {
        if index < self.fingerprints.len() {
            Some(self.fingerprints.remove(index))
        } else {
            None
        }
    }

    pub fn set_rotation_strategy(&mut self, strategy: RotationStrategy) {
        self.rotation_strategy = strategy;
    }

    pub fn get_all_fingerprints(&self) -> &[BrowserFingerprint] {
        &self.fingerprints
    }

    pub fn generate_stealth_script(&self, fingerprint: &BrowserFingerprint) -> String {
        format!(
            r#"
            Object.defineProperty(navigator, 'userAgent', {{
                get: () => '{}'
            }});
            Object.defineProperty(navigator, 'platform', {{
                get: () => '{}'
            }});
            Object.defineProperty(navigator, 'languages', {{
                get: () => ['{}']
            }});
            Object.defineProperty(screen, 'width', {{
                get: () => {}
            }});
            Object.defineProperty(screen, 'height', {{
                get: () => {}
            }});
            "#,
            fingerprint.user_agent,
            fingerprint.platform,
            fingerprint.accept_language,
            fingerprint.screen_resolution.0,
            fingerprint.screen_resolution.1
        )
    }
}
