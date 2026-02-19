use crate::types::PipelineStatus;

pub fn map_status(status: &str, conclusion: &Option<String>) -> PipelineStatus {
    match (status, conclusion) {
        ("queued", _) | ("pending", _) => PipelineStatus::Pending,
        ("in_progress", _) => PipelineStatus::Running,
        ("completed", Some("success")) => PipelineStatus::Success,
        ("completed", Some("failure")) => PipelineStatus::Failed,
        ("completed", Some("cancelled")) => PipelineStatus::Cancelled,
        ("completed", Some("skipped")) => PipelineStatus::Skipped,
        _ => PipelineStatus::Unknown,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_map_status_pending() {
        assert_eq!(map_status("queued", &None), PipelineStatus::Pending);
        assert_eq!(map_status("pending", &None), PipelineStatus::Pending);
    }

    #[test]
    fn test_map_status_running() {
        assert_eq!(map_status("in_progress", &None), PipelineStatus::Running);
    }

    #[test]
    fn test_map_status_success() {
        assert_eq!(
            map_status("completed", &Some("success".to_string())),
            PipelineStatus::Success
        );
    }

    #[test]
    fn test_map_status_failed() {
        assert_eq!(
            map_status("completed", &Some("failure".to_string())),
            PipelineStatus::Failed
        );
    }

    #[test]
    fn test_map_status_cancelled() {
        assert_eq!(
            map_status("completed", &Some("cancelled".to_string())),
            PipelineStatus::Cancelled
        );
    }

    #[test]
    fn test_map_status_skipped() {
        assert_eq!(
            map_status("completed", &Some("skipped".to_string())),
            PipelineStatus::Skipped
        );
    }

    #[test]
    fn test_map_status_unknown() {
        assert_eq!(map_status("unknown", &None), PipelineStatus::Unknown);
    }
}
