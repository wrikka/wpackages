pub mod adapters;
pub mod app;
pub mod cli;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

#[cfg(test)]
mod tests {
    #[test]
    fn smoke() {
        let v = 1;
        assert_eq!(v, 1);
    }
}
