//! An implementation of the DecayStrategy trait using an exponential decay function.

use super::{DecayError, DecayStrategy};
use crate::store::MemoryStore;
use std::f64::consts::LN_2;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ExponentialDecay {
    half_life_seconds: f64,
}

impl ExponentialDecay {
    pub fn new(half_life_seconds: f64) -> Result<Self, DecayError> {
        if half_life_seconds <= 0.0 {
            return Err(DecayError::NonPositiveHalfLife(half_life_seconds));
        }
        Ok(Self { half_life_seconds })
    }
}

impl DecayStrategy for ExponentialDecay {
    fn apply(&self, store: &mut dyn MemoryStore) -> Result<(), DecayError> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| DecayError::TimeWentBackwards)?
            .as_secs();

        // Decay constant λ = ln(2) / half-life
        let decay_constant = LN_2 / self.half_life_seconds;

        for memory in store.iter_mut() {
            let time_since_access = (now.saturating_sub(memory.last_accessed_at)) as f64;
            let decay_factor = (-decay_constant * time_since_access).exp();
            memory.strength *= decay_factor;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_with_positive_half_life_should_succeed() {
        assert!(ExponentialDecay::new(10.0).is_ok());
    }

    #[test]
    fn new_with_zero_half_life_should_fail() {
        let result = ExponentialDecay::new(0.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DecayError::NonPositiveHalfLife(0.0));
    }

    #[test]
    fn new_with_negative_half_life_should_fail() {
        let result = ExponentialDecay::new(-10.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DecayError::NonPositiveHalfLife(-10.0));
    }
}
