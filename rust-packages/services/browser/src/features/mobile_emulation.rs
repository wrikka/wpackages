use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceProfile {
    pub name: String,
    pub user_agent: String,
    pub viewport: Viewport,
    pub device_scale_factor: f64,
    pub is_mobile: bool,
    pub has_touch: bool,
    pub default_browser: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Viewport {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileEmulationConfig {
    pub device_profile: DeviceProfile,
    pub locale: String,
    pub timezone: String,
    pub geolocation: Option<Geolocation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Geolocation {
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: Option<f64>,
}

pub struct DeviceProfiles;

impl DeviceProfiles {
    pub fn get_profile(name: &str) -> Option<DeviceProfile> {
        let profiles = Self::all_profiles();
        profiles.into_iter().find(|p| p.name.to_lowercase() == name.to_lowercase())
    }

    pub fn all_profiles() -> Vec<DeviceProfile> {
        vec![
            // iPhones
            Self::iphone_14_pro_max(),
            Self::iphone_14_pro(),
            Self::iphone_14(),
            Self::iphone_13_pro_max(),
            Self::iphone_12(),
            Self::iphone_se(),
            Self::iphone_x(),
            // iPads
            Self::ipad_pro_12_9(),
            Self::ipad_pro_11(),
            Self::ipad_air(),
            Self::ipad_mini(),
            // Android Phones
            Self::pixel_7_pro(),
            Self::pixel_6(),
            Self::samsung_s23_ultra(),
            Self::samsung_s22(),
            Self::oneplus_11(),
            // Android Tablets
            Self::samsung_tab_s8(),
            // Desktop
            Self::desktop_chrome(),
            Self::desktop_firefox(),
            Self::desktop_safari(),
            Self::desktop_edge(),
        ]
    }

    fn iphone_14_pro_max() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone 14 Pro Max".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 430, height: 932 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn iphone_14_pro() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone 14 Pro".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 393, height: 852 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn iphone_14() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone 14".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 390, height: 844 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn iphone_13_pro_max() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone 13 Pro Max".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 428, height: 926 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn iphone_12() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone 12".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 390, height: 844 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn iphone_se() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone SE".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 375, height: 667 },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn iphone_x() -> DeviceProfile {
        DeviceProfile {
            name: "iPhone X".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1".to_string(),
            viewport: Viewport { width: 375, height: 812 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn ipad_pro_12_9() -> DeviceProfile {
        DeviceProfile {
            name: "iPad Pro 12.9".to_string(),
            user_agent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 1024, height: 1366 },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn ipad_pro_11() -> DeviceProfile {
        DeviceProfile {
            name: "iPad Pro 11".to_string(),
            user_agent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 834, height: 1194 },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn ipad_air() -> DeviceProfile {
        DeviceProfile {
            name: "iPad Air".to_string(),
            user_agent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 820, height: 1180 },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn ipad_mini() -> DeviceProfile {
        DeviceProfile {
            name: "iPad Mini".to_string(),
            user_agent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1".to_string(),
            viewport: Viewport { width: 768, height: 1024 },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Safari".to_string(),
        }
    }

    fn pixel_7_pro() -> DeviceProfile {
        DeviceProfile {
            name: "Pixel 7 Pro".to_string(),
            user_agent: "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36".to_string(),
            viewport: Viewport { width: 412, height: 915 },
            device_scale_factor: 2.625,
            is_mobile: true,
            has_touch: true,
            default_browser: "Chrome".to_string(),
        }
    }

    fn pixel_6() -> DeviceProfile {
        DeviceProfile {
            name: "Pixel 6".to_string(),
            user_agent: "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36".to_string(),
            viewport: Viewport { width: 412, height: 915 },
            device_scale_factor: 2.625,
            is_mobile: true,
            has_touch: true,
            default_browser: "Chrome".to_string(),
        }
    }

    fn samsung_s23_ultra() -> DeviceProfile {
        DeviceProfile {
            name: "Samsung S23 Ultra".to_string(),
            user_agent: "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36".to_string(),
            viewport: Viewport { width: 384, height: 854 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Chrome".to_string(),
        }
    }

    fn samsung_s22() -> DeviceProfile {
        DeviceProfile {
            name: "Samsung S22".to_string(),
            user_agent: "Mozilla/5.0 (Linux; Android 12; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36".to_string(),
            viewport: Viewport { width: 384, height: 854 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Chrome".to_string(),
        }
    }

    fn oneplus_11() -> DeviceProfile {
        DeviceProfile {
            name: "OnePlus 11".to_string(),
            user_agent: "Mozilla/5.0 (Linux; Android 13; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36".to_string(),
            viewport: Viewport { width: 412, height: 915 },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Chrome".to_string(),
        }
    }

    fn samsung_tab_s8() -> DeviceProfile {
        DeviceProfile {
            name: "Samsung Tab S8".to_string(),
            user_agent: "Mozilla/5.0 (Linux; Android 12; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport { width: 800, height: 1280 },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
            default_browser: "Chrome".to_string(),
        }
    }

    fn desktop_chrome() -> DeviceProfile {
        DeviceProfile {
            name: "Desktop Chrome".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36".to_string(),
            viewport: Viewport { width: 1920, height: 1080 },
            device_scale_factor: 1.0,
            is_mobile: false,
            has_touch: false,
            default_browser: "Chrome".to_string(),
        }
    }

    fn desktop_firefox() -> DeviceProfile {
        DeviceProfile {
            name: "Desktop Firefox".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0".to_string(),
            viewport: Viewport { width: 1920, height: 1080 },
            device_scale_factor: 1.0,
            is_mobile: false,
            has_touch: false,
            default_browser: "Firefox".to_string(),
        }
    }

    fn desktop_safari() -> DeviceProfile {
        DeviceProfile {
            name: "Desktop Safari".to_string(),
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15".to_string(),
            viewport: Viewport { width: 1920, height: 1080 },
            device_scale_factor: 1.0,
            is_mobile: false,
            has_touch: false,
            default_browser: "Safari".to_string(),
        }
    }

    fn desktop_edge() -> DeviceProfile {
        DeviceProfile {
            name: "Desktop Edge".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69".to_string(),
            viewport: Viewport { width: 1920, height: 1080 },
            device_scale_factor: 1.0,
            is_mobile: false,
            has_touch: false,
            default_browser: "Edge".to_string(),
        }
    }
}

pub struct MobileEmulator;

impl MobileEmulator {
    pub fn new() -> Self {
        Self
    }

    pub fn get_device_script(&self, profile: &DeviceProfile) -> String {
        format!(
            r#"
            (function() {{
                // Set viewport
                Object.defineProperty(window, 'innerWidth', {{
                    value: {},
                    writable: false
                }});
                Object.defineProperty(window, 'innerHeight', {{
                    value: {},
                    writable: false
                }});
                
                // Set device pixel ratio
                Object.defineProperty(window, 'devicePixelRatio', {{
                    value: {},
                    writable: false
                }});
                
                // Override user agent
                Object.defineProperty(navigator, 'userAgent', {{
                    value: '{}',
                    writable: false
                }});
                
                // Set mobile/touch properties
                Object.defineProperty(navigator, 'maxTouchPoints', {{
                    value: {},
                    writable: false
                }});
                
                Object.defineProperty(navigator, 'platform', {{
                    value: '{}',
                    writable: false
                }});
                
                // Fire resize event
                window.dispatchEvent(new Event('resize'));
            }})();
            "#,
            profile.viewport.width,
            profile.viewport.height,
            profile.device_scale_factor,
            profile.user_agent.replace("'", "\\'"),
            if profile.has_touch { 5 } else { 0 },
            if profile.is_mobile { "iPhone" } else { "Win32" }
        )
    }

    pub fn list_available_devices(&self) -> Vec<String> {
        DeviceProfiles::all_profiles()
            .into_iter()
            .map(|p| p.name)
            .collect()
    }
}

impl Default for MobileEmulator {
    fn default() -> Self {
        Self::new()
    }
}
