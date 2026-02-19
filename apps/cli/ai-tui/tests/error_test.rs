#[cfg(test)]
mod tests {
    use super::*;
    use std::io;

    #[test]
    fn test_error_display() {
        let err = AppError::Config(figment::Error::from(figment::error::Kind::MissingField(
            "test".to_string(),
        )));
        assert!(err.to_string().contains("Configuration error"));

        let err = AppError::Io(io::Error::new(io::ErrorKind::NotFound, "file not found"));
        assert!(err.to_string().contains("IO error"));

        let err = AppError::Service("test error".to_string());
        assert!(err.to_string().contains("Service error"));

        let err = AppError::InvalidInput("bad input".to_string());
        assert!(err.to_string().contains("Invalid input"));

        let err = AppError::NotFound("resource".to_string());
        assert!(err.to_string().contains("Not found"));

        let err = AppError::Internal("internal error".to_string());
        assert!(err.to_string().contains("Internal error"));
    }

    #[test]
    fn test_error_from_io() {
        let io_err = io::Error::new(io::ErrorKind::PermissionDenied, "access denied");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::Io(_)));
    }

    #[test]
    fn test_error_from_config() {
        let config_err =
            figment::Error::from(figment::error::Kind::MissingField("test".to_string()));
        let app_err: AppError = config_err.into();
        assert!(matches!(app_err, AppError::Config(_)));
    }

    #[test]
    fn test_result_type() {
        let ok_result: Result<i32> = Ok(42);
        assert!(ok_result.is_ok());

        let err_result: Result<i32> = Err(AppError::Service("error".to_string()));
        assert!(err_result.is_err());
    }
}
