use std::time::{Duration, Instant};

/// Debouncer for delaying function execution
#[derive(Debug, Clone)]
pub struct Debouncer {
    delay: Duration,
    last_call: Option<Instant>,
}

impl Debouncer {
    pub fn new(delay: Duration) -> Self {
        Self {
            delay,
            last_call: None,
        }
    }

    pub fn from_millis(millis: u64) -> Self {
        Self::new(Duration::from_millis(millis))
    }

    pub fn from_secs(secs: u64) -> Self {
        Self::new(Duration::from_secs(secs))
    }

    #[inline]
    pub fn should_execute(&mut self) -> bool {
        let now = Instant::now();
        
        if let Some(last) = self.last_call {
            let elapsed = now.duration_since(last);
            if elapsed >= self.delay {
                self.last_call = Some(now);
                true
            } else {
                false
            }
        } else {
            self.last_call = Some(now);
            true
        }
    }

    #[inline]
    pub fn reset(&mut self) {
        self.last_call = None;
    }

    #[inline]
    pub fn time_until_next(&self) -> Option<Duration> {
        self.last_call.and_then(|last| {
            let elapsed = Instant::now().duration_since(last);
            if elapsed < self.delay {
                Some(self.delay - elapsed)
            } else {
                None
            }
        })
    }
}

impl Default for Debouncer {
    fn default() -> Self {
        Self::from_millis(300)
    }
}

/// Debounce a function call
///
/// # Arguments
/// * `debouncer` - The debouncer
/// * `func` - The function to execute
///
/// # Returns
/// * Whether the function was executed
///
/// # Examples
/// ```no_run
/// use rsui::utils::debouncing::{debounce, Debouncer};
///
/// let mut debouncer = Debouncer::from_millis(300);
/// let executed = debounce(&mut debouncer, || {
///     println!("Executed!");
/// });
/// ```
#[inline]
pub fn debounce<F>(debouncer: &mut Debouncer, func: F) -> bool
where
    F: FnOnce(),
{
    if debouncer.should_execute() {
        func();
        true
    } else {
        false
    }
}

/// Debounce with value
///
/// # Arguments
/// * `debouncer` - The debouncer
/// * `value` - The value to debounce
/// * `func` - The function to execute with the value
///
/// # Returns
/// * Whether the function was executed
///
/// # Examples
/// ```no_run
/// use rsui::utils::debouncing::{debounce_with_value, Debouncer};
///
/// let mut debouncer = Debouncer::from_millis(300);
/// let executed = debounce_with_value(&mut debouncer, "search", |value| {
///     println!("Searching: {}", value);
/// });
/// ```
#[inline]
pub fn debounce_with_value<T, F>(debouncer: &mut Debouncer, value: T, func: F) -> bool
where
    F: FnOnce(T),
{
    if debouncer.should_execute() {
        func(value);
        true
    } else {
        false
    }
}

/// Create a debounced function
///
/// # Arguments
/// * `delay` - The debounce delay
/// * `func` - The function to debounce
///
/// # Returns
/// * A debounced function
///
/// # Examples
/// ```no_run
/// use rsui::utils::debouncing::{debounce_fn, Duration};
///
/// fn search(query: &str) {
///     println!("Searching: {}", query);
/// }
///
/// let debounced_search = debounce_fn(Duration::from_millis(300), search);
/// debounced_search("test");
/// ```
pub fn debounce_fn<T, F>(delay: Duration, func: F) -> impl Fn(T) -> bool
where
    F: Fn(T),
{
    let mut debouncer = Debouncer::new(delay);
    move |value: T| debounce_with_value(&mut debouncer, value, func)
}

/// Create a debounced function without arguments
///
/// # Arguments
/// * `delay` - The debounce delay
/// * `func` - The function to debounce
///
/// # Returns
/// * A debounced function
///
/// # Examples
/// ```no_run
/// use rsui::utils::debouncing::{debounce_fn_no_args, Duration};
///
/// fn save() {
///     println!("Saving...");
/// }
///
/// let debounced_save = debounce_fn_no_args(Duration::from_millis(500), save);
/// debounced_save();
/// ```
pub fn debounce_fn_no_args<F>(delay: Duration, func: F) -> impl Fn() -> bool
where
    F: Fn(),
{
    let mut debouncer = Debouncer::new(delay);
    move || debounce(&mut debouncer, func)
}

/// Debounce state for UI components
///
/// # Security Considerations
/// - This struct stores `String` values without size limits
/// - When using with untrusted input, consider adding size validation
/// - Large values may cause memory exhaustion
#[derive(Debug, Clone)]
pub struct DebounceState {
    pub pending_value: Option<String>,
    pub last_value: String,
    pub debouncer: Debouncer,
}

impl Default for DebounceState {
    fn default() -> Self {
        Self {
            pending_value: None,
            last_value: String::new(),
            debouncer: Debouncer::default(),
        }
    }
}

impl DebounceState {
    pub fn new(delay: Duration) -> Self {
        Self {
            pending_value: None,
            last_value: String::new(),
            debouncer: Debouncer::new(delay),
        }
    }

    pub fn from_millis(millis: u64) -> Self {
        Self::new(Duration::from_millis(millis))
    }

    /// Update the pending value and execute if debounce delay has passed
    ///
    /// # Security Considerations
    /// - This method does not validate the size of the input string
    /// - Callers should validate input size before calling this method
    /// - Large strings may cause memory exhaustion
    pub fn update(&mut self, value: String) -> Option<String> {
        self.pending_value = Some(value);
        
        if self.debouncer.should_execute() {
            if let Some(value) = self.pending_value.take() {
                self.last_value = value.clone();
                Some(value)
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn flush(&mut self) -> Option<String> {
        if let Some(pending) = self.pending_value.take() {
            self.last_value = pending;
            Some(pending)
        } else {
            None
        }
    }

    #[inline]
    pub fn is_pending(&self) -> bool {
        self.pending_value.is_some()
    }

    #[inline]
    pub fn get_last_value(&self) -> &str {
        &self.last_value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_debouncer() {
        let mut debouncer = Debouncer::from_millis(100);
        
        assert!(debouncer.should_execute());
        assert!(!debouncer.should_execute());
        
        std::thread::sleep(Duration::from_millis(150));
        assert!(debouncer.should_execute());
    }

    #[test]
    fn test_debounce() {
        let mut debouncer = Debouncer::from_millis(50);
        let mut call_count = 0;
        
        let executed = debounce(&mut debouncer, || {
            call_count += 1;
        });
        
        assert!(executed);
        assert_eq!(call_count, 1);
        
        let executed = debounce(&mut debouncer, || {
            call_count += 1;
        });
        
        assert!(!executed);
        assert_eq!(call_count, 1);
    }

    #[test]
    fn test_debounce_with_value() {
        let mut debouncer = Debouncer::from_millis(50);
        let mut last_value = None;
        
        let executed = debounce_with_value(&mut debouncer, "test", |value| {
            last_value = Some(value.to_string());
        });
        
        assert!(executed);
        assert_eq!(last_value, Some("test".to_string()));
    }

    #[test]
    fn test_debounce_state() {
        let mut state = DebounceState::from_millis(50);
        
        assert!(!state.is_pending());
        assert_eq!(state.get_last_value(), "");
        
        let result = state.update("test".to_string());
        assert!(result.is_some());
        assert_eq!(result, Some("test".to_string()));
        assert_eq!(state.get_last_value(), "test");
        
        let result = state.update("test2".to_string());
        assert!(result.is_none()); // Debounced
        
        std::thread::sleep(Duration::from_millis(100));
        let result = state.update("test2".to_string());
        assert!(result.is_some());
        assert_eq!(result, Some("test2".to_string()));
    }

    #[test]
    fn test_debounce_state_flush() {
        let mut state = DebounceState::from_millis(100);
        
        state.update("test".to_string());
        assert!(state.is_pending());
        
        let flushed = state.flush();
        assert!(flushed.is_some());
        assert_eq!(flushed, Some("test".to_string()));
        assert!(!state.is_pending());
    }
}
