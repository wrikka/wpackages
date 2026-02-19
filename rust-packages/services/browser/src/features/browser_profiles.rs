use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserProfile {
    pub name: String,
    pub description: String,
    pub user_agent: String,
    pub viewport: Viewport,
    pub locale: String,
    pub timezone: String,
    pub color_scheme: ColorScheme,
    pub reduced_motion: bool,
    pub javascript_enabled: bool,
    pub images_enabled: bool,
    pub css_enabled: bool,
    pub webgl_enabled: bool,
    pub webrtc_enabled: bool,
    pub geolocation_enabled: bool,
    pub notifications_enabled: bool,
    pub cookies_policy: CookiePolicy,
    pub cache_enabled: bool,
    pub proxy: Option<ProxyConfig>,
    pub headers: HashMap<String, String>,
    pub extra_args: Vec<String>,
    pub extensions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Viewport {
    pub width: u32,
    pub height: u32,
    pub device_scale_factor: f64,
    pub is_mobile: bool,
    pub has_touch: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColorScheme {
    Light,
    Dark,
    NoPreference,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CookiePolicy {
    AllowAll,
    BlockThirdParty,
    BlockAll,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub server: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub bypass_list: Vec<String>,
}

pub struct ProfileManager;

impl ProfileManager {
    pub fn get_profile(name: &str) -> Option<BrowserProfile> {
        match name.to_lowercase().as_str() {
            "stealth" | "stealth-mode" => Some(Self::stealth_profile()),
            "default" | "normal" => Some(Self::default_profile()),
            "aggressive" => Some(Self::aggressive_profile()),
            "minimal" => Some(Self::minimal_profile()),
            "testing" => Some(Self::testing_profile()),
            "scraping" => Some(Self::scraping_profile()),
            _ => None,
        }
    }

    pub fn list_profiles() -> Vec<&'static str> {
        vec!["stealth", "default", "aggressive", "minimal", "testing", "scraping"]
    }

    fn default_profile() -> BrowserProfile {
        BrowserProfile {
            name: "default".to_string(),
            description: "Standard browser configuration with balanced settings".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport {
                width: 1920,
                height: 1080,
                device_scale_factor: 1.0,
                is_mobile: false,
                has_touch: false,
            },
            locale: "en-US".to_string(),
            timezone: "America/New_York".to_string(),
            color_scheme: ColorScheme::NoPreference,
            reduced_motion: false,
            javascript_enabled: true,
            images_enabled: true,
            css_enabled: true,
            webgl_enabled: true,
            webrtc_enabled: true,
            geolocation_enabled: true,
            notifications_enabled: false,
            cookies_policy: CookiePolicy::AllowAll,
            cache_enabled: true,
            proxy: None,
            headers: HashMap::new(),
            extra_args: vec![],
            extensions: vec![],
        }
    }

    fn stealth_profile() -> BrowserProfile {
        let mut headers = HashMap::new();
        headers.insert("Accept-Language".to_string(), "en-US,en;q=0.9".to_string());
        headers.insert("Accept".to_string(), "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8".to_string());
        headers.insert("Accept-Encoding".to_string(), "gzip, deflate, br".to_string());
        headers.insert("DNT".to_string(), "1".to_string());
        headers.insert("Upgrade-Insecure-Requests".to_string(), "1".to_string());

        BrowserProfile {
            name: "stealth".to_string(),
            description: "Enhanced privacy and anti-detection features".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport {
                width: 1920,
                height: 1080,
                device_scale_factor: 1.0,
                is_mobile: false,
                has_touch: false,
            },
            locale: "en-US".to_string(),
            timezone: "America/New_York".to_string(),
            color_scheme: ColorScheme::NoPreference,
            reduced_motion: false,
            javascript_enabled: true,
            images_enabled: true,
            css_enabled: true,
            webgl_enabled: false, // Disable WebGL to prevent fingerprinting
            webrtc_enabled: false, // Disable WebRTC to prevent IP leak
            geolocation_enabled: false,
            notifications_enabled: false,
            cookies_policy: CookiePolicy::BlockThirdParty,
            cache_enabled: true,
            proxy: None,
            headers,
            extra_args: vec![
                "--disable-blink-features=AutomationControlled".to_string(),
                "--disable-features=IsolateOrigins,site-per-process".to_string(),
                "--disable-site-isolation-trials".to_string(),
                "--disable-web-security".to_string(),
                "--disable-features=BlockInsecurePrivateNetworkRequests".to_string(),
            ],
            extensions: vec![],
        }
    }

    fn aggressive_profile() -> BrowserProfile {
        BrowserProfile {
            name: "aggressive".to_string(),
            description: "Fast loading with many features disabled".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport {
                width: 1920,
                height: 1080,
                device_scale_factor: 1.0,
                is_mobile: false,
                has_touch: false,
            },
            locale: "en-US".to_string(),
            timezone: "America/New_York".to_string(),
            color_scheme: ColorScheme::NoPreference,
            reduced_motion: true,
            javascript_enabled: true,
            images_enabled: false, // Disable images for faster loading
            css_enabled: true,
            webgl_enabled: false,
            webrtc_enabled: false,
            geolocation_enabled: false,
            notifications_enabled: false,
            cookies_policy: CookiePolicy::BlockThirdParty,
            cache_enabled: true,
            proxy: None,
            headers: HashMap::new(),
            extra_args: vec![
                "--disable-images".to_string(),
                "--blink-settings=imagesEnabled=false".to_string(),
                "--disable-extensions".to_string(),
                "--disable-plugins".to_string(),
                "--disable-javascript".to_string(),
            ],
            extensions: vec![],
        }
    }

    fn minimal_profile() -> BrowserProfile {
        BrowserProfile {
            name: "minimal".to_string(),
            description: "Minimal resource usage for maximum efficiency".to_string(),
            user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport {
                width: 1280,
                height: 720,
                device_scale_factor: 1.0,
                is_mobile: false,
                has_touch: false,
            },
            locale: "en-US".to_string(),
            timezone: "UTC".to_string(),
            color_scheme: ColorScheme::Light,
            reduced_motion: true,
            javascript_enabled: true,
            images_enabled: true,
            css_enabled: true,
            webgl_enabled: false,
            webrtc_enabled: false,
            geolocation_enabled: false,
            notifications_enabled: false,
            cookies_policy: CookiePolicy::BlockThirdParty,
            cache_enabled: false,
            proxy: None,
            headers: HashMap::new(),
            extra_args: vec![
                "--no-sandbox".to_string(),
                "--disable-setuid-sandbox".to_string(),
                "--disable-dev-shm-usage".to_string(),
                "--disable-accelerated-2d-canvas".to_string(),
                "--no-first-run".to_string(),
                "--no-zygote".to_string(),
                "--single-process".to_string(),
                "--disable-gpu".to_string(),
            ],
            extensions: vec![],
        }
    }

    fn testing_profile() -> BrowserProfile {
        BrowserProfile {
            name: "testing".to_string(),
            description: "Optimized for automated testing with stable behavior".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport {
                width: 1920,
                height: 1080,
                device_scale_factor: 1.0,
                is_mobile: false,
                has_touch: false,
            },
            locale: "en-US".to_string(),
            timezone: "UTC".to_string(),
            color_scheme: ColorScheme::NoPreference,
            reduced_motion: true,
            javascript_enabled: true,
            images_enabled: true,
            css_enabled: true,
            webgl_enabled: true,
            webrtc_enabled: false,
            geolocation_enabled: false,
            notifications_enabled: false,
            cookies_policy: CookiePolicy::AllowAll,
            cache_enabled: false, // Disable cache for consistent test results
            proxy: None,
            headers: HashMap::new(),
            extra_args: vec![
                "--no-sandbox".to_string(),
                "--disable-setuid-sandbox".to_string(),
                "--disable-dev-shm-usage".to_string(),
                "--disable-background-networking".to_string(),
                "--disable-background-timer-throttling".to_string(),
                "--disable-backgrounding-occluded-windows".to_string(),
                "--disable-breakpad".to_string(),
                "--disable-component-update".to_string(),
                "--disable-default-apps".to_string(),
                "--disable-features=TranslateUI".to_string(),
                "--disable-hang-monitor".to_string(),
                "--disable-ipc-flooding-protection".to_string(),
                "--disable-popup-blocking".to_string(),
                "--disable-prompt-on-repost".to_string(),
                "--disable-renderer-backgrounding".to_string(),
                "--force-color-profile=srgb".to_string(),
                "--metrics-recording-only".to_string(),
                "--safebrowsing-disable-auto-update".to_string(),
            ],
            extensions: vec![],
        }
    }

    fn scraping_profile() -> BrowserProfile {
        let mut headers = HashMap::new();
        headers.insert("Accept".to_string(), "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8".to_string());
        headers.insert("Accept-Language".to_string(), "en-US,en;q=0.5".to_string());
        headers.insert("Accept-Encoding".to_string(), "gzip, deflate".to_string());
        headers.insert("DNT".to_string(), "1".to_string());
        headers.insert("Connection".to_string(), "keep-alive".to_string());

        BrowserProfile {
            name: "scraping".to_string(),
            description: "Optimized for web scraping with stealth features".to_string(),
            user_agent: "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0".to_string(),
            viewport: Viewport {
                width: 1366,
                height: 768,
                device_scale_factor: 1.0,
                is_mobile: false,
                has_touch: false,
            },
            locale: "en-US".to_string(),
            timezone: "America/New_York".to_string(),
            color_scheme: ColorScheme::NoPreference,
            reduced_motion: false,
            javascript_enabled: true,
            images_enabled: false, // Disable images for faster scraping
            css_enabled: true,
            webgl_enabled: false,
            webrtc_enabled: false,
            geolocation_enabled: false,
            notifications_enabled: false,
            cookies_policy: CookiePolicy::BlockThirdParty,
            cache_enabled: true,
            proxy: None,
            headers,
            extra_args: vec![
                "--disable-blink-features=AutomationControlled".to_string(),
                "--disable-web-security".to_string(),
                "--disable-features=IsolateOrigins,site-per-process".to_string(),
                "--blink-settings=imagesEnabled=false".to_string(),
                "--disable-javascript".to_string(),
            ],
            extensions: vec![],
        }
    }

    pub fn apply_to_config(&self, profile: &BrowserProfile) -> Vec<String> {
        let mut args = profile.extra_args.clone();

        // Add user agent if specified
        if !profile.user_agent.is_empty() {
            args.push(format!("--user-agent={}", profile.user_agent));
        }

        // Add viewport settings
        args.push(format!("--window-size={}, {}", profile.viewport.width, profile.viewport.height));

        // Add locale
        args.push(format!("--lang={}", profile.locale));

        // Add proxy if configured
        if let Some(ref proxy) = profile.proxy {
            if let Some(ref username) = proxy.username {
                args.push(format!(
                    "--proxy-server=http://{}:{}@{}",
                    username,
                    proxy.password.as_deref().unwrap_or(""),
                    proxy.server
                ));
            } else {
                args.push(format!("--proxy-server=http:// {}", proxy.server));
            }
        }

        args
    }
}
