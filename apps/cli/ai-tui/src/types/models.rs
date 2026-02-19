//! Domain models

use crate::types::{ItemDescription, ItemId, ItemName};

#[derive(Debug, Clone, PartialEq)]
pub struct Item {
    pub id: ItemId,
    pub name: ItemName,
    pub description: ItemDescription,
}

impl Item {
    pub fn new(
        id: impl Into<ItemId>,
        name: impl Into<ItemName>,
        description: impl Into<ItemDescription>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: description.into(),
        }
    }
}
