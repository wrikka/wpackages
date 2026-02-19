//! Logging macros for convenience

/// Macro for convenient info logging
#[macro_export]
macro_rules! log_info {
    ($logger:expr, $message:expr $(, $key:expr => $value:expr)*) => {
        $logger.info($message, &[$(($key, &$value as &dyn std::fmt::Display)),*]);
    };
}

/// Macro for convenient error logging
#[macro_export]
macro_rules! log_error {
    ($logger:expr, $message:expr $(, $key:expr => $value:expr)*) => {
        $logger.error($message, &[$(($key, &$value as &dyn std::fmt::Display)),*]);
    };
}

/// Macro for convenient warning logging
#[macro_export]
macro_rules! log_warn {
    ($logger:expr, $message:expr $(, $key:expr => $value:expr)*) => {
        $logger.warn($message, &[$(($key, &$value as &dyn std::fmt::Display)),*]);
    };
}

/// Macro for convenient debug logging
#[macro_export]
macro_rules! log_debug {
    ($logger:expr, $message:expr $(, $key:expr => $value:expr)*) => {
        $logger.debug($message, &[$(($key, &$value as &dyn std::fmt::Display)),*]);
    };
}

/// Macro for convenient trace logging
#[macro_export]
macro_rules! log_trace {
    ($logger:expr, $message:expr $(, $key:expr => $value:expr)*) => {
        $logger.trace($message, &[$(($key, &$value as &dyn std::fmt::Display)),*]);
    };
}
