//! Geometry types (Position, BoundingBox, etc.)

use serde::{Deserialize, Serialize};

/// 2D position
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

impl Position {
    pub const fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }

    pub const fn zero() -> Self {
        Self { x: 0, y: 0 }
    }
}

/// Bounding box
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl BoundingBox {
    pub const fn new(x: i32, y: i32, width: u32, height: u32) -> Self {
        Self {
            x,
            y,
            width,
            height,
        }
    }

    pub const fn center(&self) -> Position {
        Position::new(
            self.x + (self.width as i32 / 2),
            self.y + (self.height as i32 / 2),
        )
    }

    pub const fn contains(&self, pos: Position) -> bool {
        pos.x >= self.x
            && pos.x <= self.x + self.width as i32
            && pos.y >= self.y
            && pos.y <= self.y + self.height as i32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_position() {
        let pos = Position::new(100, 200);
        assert_eq!(pos.x, 100);
        assert_eq!(pos.y, 200);
    }

    #[test]
    fn test_bounding_box_center() {
        let bbox = BoundingBox::new(0, 0, 100, 200);
        let center = bbox.center();
        assert_eq!(center.x, 50);
        assert_eq!(center.y, 100);
    }

    #[test]
    fn test_bounding_box_contains() {
        let bbox = BoundingBox::new(0, 0, 100, 100);
        assert!(bbox.contains(Position::new(50, 50)));
        assert!(!bbox.contains(Position::new(150, 150)));
    }
}
