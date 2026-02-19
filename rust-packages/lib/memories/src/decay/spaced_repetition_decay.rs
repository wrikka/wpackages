//! An implementation of the DecayStrategy trait that uses memory stability.

use super::{DecayError, DecayStrategy};
use crate::store::MemoryStore;
use std::f64::consts::LN_2;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SpacedRepetitionDecay {
    base_half_life_seconds: f64,
}

impl SpacedRepetitionDecay {
    pub fn new(base_half_life_seconds: f64) -> Result<Self, DecayError> {
        if base_half_life_seconds <= 0.0 {
            return Err(DecayError::NonPositiveHalfLife(base_half_life_seconds));
        }
        Ok(Self { base_half_life_seconds })
    }
}

impl DecayStrategy for SpacedRepetitionDecay {
    fn apply(&self, store: &mut dyn MemoryStore) -> Result<(), DecayError> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| DecayError::TimeWentBackwards)?
            .as_secs();

        for memory in store.iter_mut() {
            // The effective half-life is scaled by the memory's stability.
            let effective_half_life = self.base_half_life_seconds * memory.stability;
            if effective_half_life <= 0.0 {
                continue; // Or handle as an error
            }
            let decay_constant = LN_2 / effective_half_life;

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
    fn new_with_positive_base_half_life_should_succeed() {
        assert!(SpacedRepetitionDecay::new(10.0).is_ok());
    }

    #[test]
    fn new_with_zero_base_half_life_should_fail() {
        let result = SpacedRepetitionDecay::new(0.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DecayError::NonPositiveHalfLife(0.0));
    }

    #[test]
    fn new_with_negative_base_half_life_should_fail() {
        let result = SpacedRepetitionDecay::new(-10.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DecayError::NonPositiveHalfLife(-10.0));
    }
}
