/// Integration tests for the extensions crate.
use extensions::components::dependency_resolver;
use extensions::services::PermissionService;
use extensions::types::manifest::{ExtensionCategory, ExtensionManifest, Permission};
use extensions::types::ExtensionId;

#[test]
fn resolves_dependencies_in_deterministic_order() {
    let ext_a = ExtensionManifest {
        name: "A".to_string(),
        id: ExtensionId::new("ext.a"),
        version: "0.0.0".to_string(),
        author: "".to_string(),
        repository: "".to_string(),
        description: "".to_string(),
        category: ExtensionCategory::Other,
        dependencies: None,
        permissions: vec![],
    };
    let ext_b = ExtensionManifest {
        name: "B".to_string(),
        id: ExtensionId::new("ext.b"),
        version: "0.0.0".to_string(),
        author: "".to_string(),
        repository: "".to_string(),
        description: "".to_string(),
        category: ExtensionCategory::Other,
        dependencies: Some(vec![ext_a.id.clone()]),
        permissions: vec![],
    };

    let manifests: Vec<&ExtensionManifest> = vec![&ext_b, &ext_a];
    let order = dependency_resolver::resolve_dependencies(&manifests).unwrap();

    assert_eq!(order, vec![ext_a.id.clone(), ext_b.id.clone()]);
}

#[test]
fn permission_service_tracks_permissions_by_extension_id() {
    let service = PermissionService::new();
    let ext_id = ExtensionId::new("ext.test");

    assert!(!service.has_permission(&ext_id, Permission::Network));

    service.grant_permissions(&ext_id, &[Permission::Network]);
    assert!(service.has_permission(&ext_id, Permission::Network));

    service.revoke_permissions(&ext_id);
    assert!(!service.has_permission(&ext_id, Permission::Network));
}
