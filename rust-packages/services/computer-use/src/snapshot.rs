use crate::error::{Error, Result};
use crate::protocol::{ScreenInfo, Snapshot, SnapshotNode};

pub struct SnapshotBuilder;

impl SnapshotBuilder {
    pub fn new() -> Self {
        Self
    }

    pub fn snapshot(&self) -> Result<Snapshot> {
        let screens = screenshots::Screen::all().map_err(|e| Error::Computer(e.to_string()))?;

        if screens.is_empty() {
            return Err(Error::Computer("No screens detected".to_string()));
        }

        let mut min_x: i32 = i32::MAX;
        let mut min_y: i32 = i32::MAX;
        let mut max_x: i32 = i32::MIN;
        let mut max_y: i32 = i32::MIN;

        let mut screen_infos: Vec<ScreenInfo> = Vec::new();
        let mut nodes: Vec<SnapshotNode> = Vec::new();

        for (i, s) in screens.iter().enumerate() {
            let di = &s.display_info;

            let x = di.x;
            let y = di.y;
            let width = di.width as u32;
            let height = di.height as u32;

            min_x = min_x.min(x);
            min_y = min_y.min(y);
            max_x = max_x.max(x + di.width as i32);
            max_y = max_y.max(y + di.height as i32);

            let info = ScreenInfo {
                index: i as u32,
                x,
                y,
                width,
                height,
                is_primary: di.is_primary,
            };
            screen_infos.push(info.clone());

            let ref_id = format!("e{}", i + 1);
            let name = if di.is_primary {
                Some(format!("screen {} (primary)", i))
            } else {
                Some(format!("screen {}", i))
            };

            nodes.push(SnapshotNode {
                ref_id,
                role: "screen".to_string(),
                name,
                description: None,
                attributes: Some(serde_json::json!({
                    "index": i,
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height
                })),
            });
        }

        let virtual_width = (max_x - min_x).max(0) as u32;
        let virtual_height = (max_y - min_y).max(0) as u32;

        Ok(Snapshot {
            width: virtual_width,
            height: virtual_height,
            screens: screen_infos,
            nodes,
        })
    }
}
