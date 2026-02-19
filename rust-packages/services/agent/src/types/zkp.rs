//! types/zkp.rs

use serde::{Deserialize, Serialize};

/// Represents a Zero-Knowledge Proof for an action.
/// In a real system, this would contain the cryptographic proof data.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionProof {
    pub proof_data: Vec<u8>,
    pub public_inputs: Vec<String>,
}
