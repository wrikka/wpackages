use serde::Deserialize;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize)]
pub struct ExtensionId(pub String);

impl ExtensionId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CommandId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ComponentId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct WebviewId(pub String);

impl WebviewId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }
}

impl ComponentId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }
}

impl CommandId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }
}
