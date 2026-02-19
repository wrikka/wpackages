//! UX improvement types

use serde::{Deserialize, Serialize};

/// UX improvement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UxImprovement {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: UxCategory,
    pub priority: UxPriority,
    pub impact: UxImpact,
    pub implemented: bool,
}

impl UxImprovement {
    pub fn new(id: impl Into<String>, name: impl Into<String>, description: impl Into<String>, category: UxCategory) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: description.into(),
            category,
            priority: UxPriority::Medium,
            impact: UxImpact::Medium,
            implemented: false,
        }
    }

    pub fn with_priority(mut self, priority: UxPriority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_impact(mut self, impact: UxImpact) -> Self {
        self.impact = impact;
        self
    }

    pub fn with_implemented(mut self, implemented: bool) -> Self {
        self.implemented = implemented;
        self
    }
}

/// UX category
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UxCategory {
    Navigation,
    Editor,
    Search,
    Debugging,
    Testing,
    Git,
    Themes,
    KeyboardShortcuts,
    Accessibility,
    Performance,
}

/// UX priority
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UxPriority {
    Low,
    Medium,
    High,
    Critical,
}

/// UX impact
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UxImpact {
    Low,
    Medium,
    High,
    Significant,
}

/// Common UX improvements
pub struct CommonUxImprovements;

impl CommonUxImprovements {
    pub fn all() -> Vec<UxImprovement> {
        vec![
            UxImprovement::new(
                "ux1",
                "Quick Open",
                "Quick file opening with fuzzy search",
                UxCategory::Navigation,
            )
            .with_priority(UxPriority::High)
            .with_impact(UxImpact::Significant),
            UxImprovement::new(
                "ux2",
                "Command Palette",
                "Quick access to all IDE commands",
                UxCategory::KeyboardShortcuts,
            )
            .with_priority(UxPriority::High)
            .with_impact(UxImpact::Significant),
            UxImprovement::new(
                "ux3",
                "Multi-cursor Editing",
                "Edit multiple locations simultaneously",
                UxCategory::Editor,
            )
            .with_priority(UxPriority::High)
            .with_impact(UxImpact::High),
            UxImprovement::new(
                "ux4",
                "Inline Errors",
                "Show errors inline with code",
                UxCategory::Editor,
            )
            .with_priority(UxPriority::Medium)
            .with_impact(UxImpact::High),
            UxImprovement::new(
                "ux5",
                "Git Integration",
                "Seamless Git workflow",
                UxCategory::Git,
            )
            .with_priority(UxPriority::High)
            .with_impact(UxImpact::High),
            UxImprovement::new(
                "ux6",
                "Dark Theme",
                "Dark theme for reduced eye strain",
                UxCategory::Themes,
            )
            .with_priority(UxPriority::Medium)
            .with_impact(UxImpact::Medium),
            UxImprovement::new(
                "ux7",
                "Keyboard Shortcuts",
                "Customizable keyboard shortcuts",
                UxCategory::KeyboardShortcuts,
            )
            .with_priority(UxPriority::Medium)
            .with_impact(UxImpact::Medium),
            UxImprovement::new(
                "ux8",
                "Accessibility",
                "Screen reader support and keyboard navigation",
                UxCategory::Accessibility,
            )
            .with_priority(UxPriority::Critical)
            .with_impact(UxImpact::Significant),
        ]
    }
}
