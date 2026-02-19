//! Test fixture data for extension manifests.

use extensions::types::manifest::{ExtensionCategory, ExtensionManifest, Permission};
use extensions::types::id::ExtensionId;

/// Creates a minimal test extension manifest.
pub fn minimal_manifest() -> ExtensionManifest {
    ExtensionManifest {
        name: "test-extension".to_string(),
        id: ExtensionId::new("test-extension"),
        version: "0.1.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/test-extension".to_string(),
        description: "A test extension".to_string(),
        category: ExtensionCategory::Other,
        dependencies: None,
        permissions: vec![],
    }
}

/// Creates a test extension manifest with dependencies.
pub fn manifest_with_dependencies() -> ExtensionManifest {
    ExtensionManifest {
        name: "dependent-extension".to_string(),
        id: ExtensionId::new("dependent-extension"),
        version: "0.1.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/dependent-extension".to_string(),
        description: "An extension with dependencies".to_string(),
        category: ExtensionCategory::Other,
        dependencies: Some(vec![
            ExtensionId::new("dependency-1"),
            ExtensionId::new("dependency-2"),
        ]),
        permissions: vec![],
    }
}

/// Creates a test extension manifest with permissions.
pub fn manifest_with_permissions() -> ExtensionManifest {
    ExtensionManifest {
        name: "privileged-extension".to_string(),
        id: ExtensionId::new("privileged-extension"),
        version: "0.1.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/privileged-extension".to_string(),
        description: "An extension with permissions".to_string(),
        category: ExtensionCategory::Other,
        dependencies: None,
        permissions: vec![
            Permission::ReadFs,
            Permission::WriteFs,
            Permission::Network,
        ],
    }
}

/// Creates a test extension manifest with all features.
pub fn full_manifest() -> ExtensionManifest {
    ExtensionManifest {
        name: "full-extension".to_string(),
        id: ExtensionId::new("full-extension"),
        version: "1.0.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/full-extension".to_string(),
        description: "A full-featured test extension".to_string(),
        category: ExtensionCategory::Other,
        dependencies: Some(vec![
            ExtensionId::new("dep-1"),
            ExtensionId::new("dep-2"),
            ExtensionId::new("dep-3"),
        ]),
        permissions: vec![
            Permission::ReadFs,
            Permission::WriteFs,
            Permission::Network,
        ],
    }
}
