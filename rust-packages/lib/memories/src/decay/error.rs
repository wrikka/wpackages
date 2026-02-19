use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum DecayError {
    #[error("Half-life must be positive, but got {0}")]
    NonPositiveHalfLife(f64),

    #[error("System time went backwards")]
    TimeWentBackwards,
}
