use crate::types::widgets::ButtonVariant;
use crate::components::button;
use crate::context::RsuiContext;
use crate::types::theme::RsuiTheme;

#[test]
fn test_button_variant_display() {
    let primary = ButtonVariant::Primary;
    let secondary = ButtonVariant::Secondary;
    let destructive = ButtonVariant::Destructive;
    let ghost = ButtonVariant::Ghost;
    let outline = ButtonVariant::Outline;
    
    // Test that all variants can be created
    assert_eq!(format!("{:?}", primary), "Primary");
    assert_eq!(format!("{:?}", secondary), "Secondary");
    assert_eq!(format!("{:?}", destructive), "Destructive");
    assert_eq!(format!("{:?}", ghost), "Ghost");
    assert_eq!(format!("{:?}", outline), "Outline");
}

#[test]
fn test_button_variant_clone() {
    let variant = ButtonVariant::Primary;
    let cloned = variant.clone();
    assert_eq!(variant, cloned);
}

#[test]
fn test_button_variant_copy() {
    let variant = ButtonVariant::Primary;
    let copied = variant;
    assert_eq!(variant, copied);
}

#[test]
fn test_button_variant_default() {
    let default = ButtonVariant::default();
    assert_eq!(default, ButtonVariant::Primary);
}

#[test]
fn test_button_variant_equality() {
    let v1 = ButtonVariant::Primary;
    let v2 = ButtonVariant::Primary;
    let v3 = ButtonVariant::Secondary;
    
    assert_eq!(v1, v2);
    assert_ne!(v1, v3);
}
