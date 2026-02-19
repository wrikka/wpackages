//! Test fixture data for extensions.

use extensions::types::loaded_extension::LoadedExtension;
use extensions::types::manifest::ExtensionManifest;
use extensions::types::id::ExtensionId;
use std::sync::Arc;

/// Mock extension instance for testing.
pub struct MockExtensionInstance {
    pub id: ExtensionId,
    pub activated: bool,
    pub deactivated: bool,
    pub unloaded: bool,
}

impl MockExtensionInstance {
    pub fn new(id: ExtensionId) -> Self {
        Self {
            id,
            activated: false,
            deactivated: false,
            unloaded: false,
        }
    }

    pub fn is_activated(&self) -> bool {
        self.activated
    }

    pub fn is_deactivated(&self) -> bool {
        self.deactivated
    }

    pub fn is_unloaded(&self) -> bool {
        self.unloaded
    }
}

#[async_trait::async_trait]
impl extensions::types::loaded_extension::ExtensionInstanceTrait for MockExtensionInstance {
    async fn on_activate(&mut self, _context: extensions::types::ActivationContext) {
        self.activated = true;
    }

    async fn on_deactivate(&mut self) {
        self.deactivated = true;
    }

    async fn on_unload(&mut self) {
        self.unloaded = true;
    }
}

/// Creates a test loaded extension.
pub fn create_test_extension(manifest: ExtensionManifest) -> LoadedExtension {
    let instance = MockExtensionInstance::new(manifest.id.clone());
    LoadedExtension {
        manifest,
        instance: Arc::new(tokio::sync::Mutex::new(instance)),
    }
}

/// Creates a simple test extension.
pub fn simple_test_extension() -> LoadedExtension {
    create_test_extension(super::manifest::minimal_manifest())
}

/// Creates a test extension with dependencies.
pub fn test_extension_with_dependencies() -> LoadedExtension {
    create_test_extension(super::manifest::manifest_with_dependencies())
}

/// Creates a test extension with permissions.
pub fn test_extension_with_permissions() -> LoadedExtension {
    create_test_extension(super::manifest::manifest_with_permissions())
}

/// Creates a full test extension.
pub fn full_test_extension() -> LoadedExtension {
    create_test_extension(super::manifest::full_manifest())
}

/// Creates multiple test extensions for testing dependency resolution.
pub fn create_test_extensions_chain() -> Vec<LoadedExtension> {
    let dep1 = ExtensionManifest {
        name: "dependency-1".to_string(),
        id: ExtensionId::new("dependency-1"),
        version: "0.1.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/dep1".to_string(),
        description: "First dependency".to_string(),
        category: extensions::types::manifest::ExtensionCategory::Other,
        dependencies: None,
        permissions: vec![],
    };

    let dep2 = ExtensionManifest {
        name: "dependency-2".to_string(),
        id: ExtensionId::new("dependency-2"),
        version: "0.1.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/dep2".to_string(),
        description: "Second dependency".to_string(),
        category: extensions::types::manifest::ExtensionCategory::Other,
        dependencies: Some(vec![ExtensionId::new("dependency-1")]),
        permissions: vec![],
    };

    let main = ExtensionManifest {
        name: "main-extension".to_string(),
        id: ExtensionId::new("main-extension"),
        version: "0.1.0".to_string(),
        author: "Test Author".to_string(),
        repository: "https://github.com/test/main".to_string(),
        description: "Main extension".to_string(),
        category: extensions::types::manifest::ExtensionCategory::Other,
        dependencies: Some(vec![
            ExtensionId::new("dependency-2"),
        ]),
        permissions: vec![],
    };

    vec![
        create_test_extension(dep1),
        create_test_extension(dep2),
        create_test_extension(main),
    ]
}
