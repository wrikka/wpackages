pub use crate::types::TestHistory;
pub use crate::types::TestRunRecord;
pub use crate::types::TestStats;
pub use crate::types::HistoryStore;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_history_types_exported() {
        let history = TestHistory::new();
        assert_eq!(history.total_runs(), 0);
    }
}
