//! # Git Graph Service
//!
//! Service for managing Git graph visualization including
//! 3D/2D rendering, filtering, and interaction.

mod impl_mod;
mod trait_mod;

pub use impl_mod::GraphServiceImpl;
pub use trait_mod::{GraphResult, GraphService};
