use crate::types::id::{ComponentId, WebviewId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ComponentLocation {
    Sidebar,
    Panel,
    StatusBar,
}

#[derive(Debug, Clone)]
pub struct UIComponentSpec {
    pub id: ComponentId,
    pub title: String,
    pub location: ComponentLocation,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeColors {
    pub primary: Color,
    pub background: Color,
    pub text: Color,
    pub accent: Color,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThemeKind {
    Light,
    Dark,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub kind: ThemeKind,
    pub colors: ThemeColors,
}

#[derive(Debug, Clone)]
pub struct WebviewSpec {
    pub id: WebviewId,
    pub title: String,
    // The initial HTML content to load
    pub html_content: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ViewId {
    Extensions,
    Settings,
    GitHub,
    Git,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExtensionCommand {
    OpenView(ViewId),
    ToggleTerminal,
}
