use std::time::{Duration, Instant};
use std::collections::VecDeque;

mod throttling_tests;

/// Throttler for limiting function execution rate
#[derive(Debug, Clone)]
pub struct Throttler {
    interval: Duration,
    last_call: Option<Instant>,
}

impl Throttler {
    pub fn new(interval: Duration) -> Self {
        Self {
            interval,
            last_call: None,
        }
    }

    pub fn from_millis(millis: u64) -> Self {
        Self::new(Duration::from_millis(millis))
    }

    pub fn from_secs(secs: u64) -> Self {
        Self::new(Duration::from_secs(secs))
    }

    pub fn should_execute(&mut self) -> bool {
        let now = Instant::now();
        
        if let Some(last) = self.last_call {
            let elapsed = now.duration_since(last);
            if elapsed >= self.interval {
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

    pub fn reset(&mut self) {
        self.last_call = None;
    }

    pub fn time_until_next(&self) -> Option<Duration> {
        self.last_call.and_then(|last| {
            let elapsed = Instant::now().duration_since(last);
            if elapsed < self.interval {
                Some(self.interval - elapsed)
            } else {
                None
            }
        })
    }

    pub fn calls_per_second(&self) -> f64 {
        1000.0 / self.interval.as_millis() as f64
    }
}

impl Default for Throttler {
    fn default() -> Self {
        Self::from_millis(100)
    }
}

/// Throttle a function call
///
/// # Arguments
/// * `throttler` - The throttler
/// * `func` - The function to execute
///
/// # Returns
/// * Whether the function was executed
///
/// # Examples
/// ```no_run
/// use rsui::utils::throttling::{throttle, Throttler};
///
/// let mut throttler = Throttler::from_millis(100);
/// let executed = throttle(&mut throttler, || {
///     println!("Executed!");
/// });
/// ```
pub fn throttle<F>(throttler: &mut Throttler, func: F) -> bool
where
    F: FnOnce(),
{
    if throttler.should_execute() {
        func();
        true
    } else {
        false
    }
}

/// Throttle with value
///
/// # Arguments
/// * `throttler` - The throttler
/// * `value` - The value to throttle
/// * `func` - The function to execute with the value
///
/// # Returns
/// * Whether the function was executed
///
/// # Examples
/// ```no_run
/// use rsui::utils::throttling::{throttle_with_value, Throttler};
///
/// let mut throttler = Throttler::from_millis(100);
/// let executed = throttle_with_value(&mut throttler, "scroll", |value| {
///     println!("Scrolling: {}", value);
/// });
/// ```
pub fn throttle_with_value<T, F>(throttler: &mut Throttler, value: T, func: F) -> bool
where
    F: FnOnce(T),
{
    if throttler.should_execute() {
        func(value);
        true
    } else {
        false
    }
}

/// Create a throttled function
///
/// # Arguments
/// * `interval` - The throttle interval
/// * `func` - The function to throttle
///
/// # Returns
/// * A throttled function
///
/// # Examples
/// ```no_run
/// use rsui::utils::throttling::{throttle_fn, Duration};
///
/// fn handle_scroll(position: f32) {
///     println!("Scrolling to: {}", position);
/// }
///
/// let throttled_scroll = throttle_fn(Duration::from_millis(100), handle_scroll);
/// throttled_scroll(50.0);
/// ```
pub fn throttle_fn<T, F>(interval: Duration, func: F) -> impl Fn(T) -> bool
where
    F: Fn(T),
{
    let mut throttler = Throttler::new(interval);
    move |value: T| throttle_with_value(&mut throttler, value, func)
}

/// Create a throttled function without arguments
///
/// # Arguments
/// * `interval` - The throttle interval
/// * `func` - The function to throttle
///
/// # Returns
/// * A throttled function
///
/// # Examples
/// ```no_run
/// use rsui::utils::throttling::{throttle_fn_no_args, Duration};
///
/// fn update_ui() {
///     println!("Updating UI...");
/// }
///
/// let throttled_update = throttle_fn_no_args(Duration::from_millis(16), update_ui);
/// throttled_update();
/// ```
pub fn throttle_fn_no_args<F>(interval: Duration, func: F) -> impl Fn() -> bool
where
    F: Fn(),
{
    let mut throttler = Throttler::new(interval);
    move || throttle(&mut throttler, func)
}

/// Throttle state for UI components
#[derive(Debug, Clone)]
pub struct ThrottleState {
    pub pending_value: Option<String>,
    pub last_value: String,
    pub throttler: Throttler,
}

impl Default for ThrottleState {
    fn default() -> Self {
        Self {
            pending_value: None,
            last_value: String::new(),
            throttler: Throttler::default(),
        }
    }
}

impl ThrottleState {
    pub fn new(interval: Duration) -> Self {
        Self {
            pending_value: None,
            last_value: String::new(),
            throttler: Throttler::new(interval),
        }
    }

    pub fn from_millis(millis: u64) -> Self {
        Self::new(Duration::from_millis(millis))
    }

    pub fn update(&mut self, value: String) -> Option<String> {
        self.pending_value = Some(value);
        
        if self.throttler.should_execute() {
            let value = self.pending_value.take().unwrap();
            self.last_value = value.clone();
            Some(value)
        } else {
            None
        }
    }

    pub fn flush(&mut self) -> Option<String> {
        if let Some(pending) = self.pending_value.take() {
            self.last_value = pending.clone();
            Some(pending)
        } else {
            None
        }
    }

    pub fn is_pending(&self) -> bool {
        self.pending_value.is_some()
    }

    pub fn get_last_value(&self) -> &str {
        &self.last_value
    }

    pub fn get_calls_per_second(&self) -> f64 {
        self.throttler.calls_per_second()
    }
}

/// Request throttler for API calls
pub struct RequestThrottler {
    max_requests: usize,
    requests: VecDeque<Instant>,
    window: Duration,
}

impl RequestThrottler {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            max_requests,
            requests: VecDeque::with_capacity(max_requests),
            window,
        }
    }

    pub fn from_per_second(max_requests: usize) -> Self {
        Self::new(max_requests, Duration::from_secs(1))
    }

    pub fn from_per_minute(max_requests: usize) -> Self {
        Self::new(max_requests, Duration::from_secs(60))
    }

    pub fn can_make_request(&mut self) -> bool {
        let now = Instant::now();
        
        // Remove old requests outside the window (O(1) with VecDeque)
        while let Some(&req) = self.requests.front() {
            if now.duration_since(req) >= self.window {
                self.requests.pop_front();
            } else {
                break;
            }
        }
        
        if self.requests.len() < self.max_requests {
            self.requests.push_back(now);
            true
        } else {
            false
        }
    }

    pub fn time_until_next_request(&self) -> Option<Duration> {
        if self.requests.len() >= self.max_requests {
            if let Some(oldest) = self.requests.front() {
                let time_since_oldest = Instant::now().duration_since(oldest);
                if time_since_oldest < self.window {
                    Some(self.window - time_since_oldest)
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn reset(&mut self) {
        self.requests.clear();
    }

    pub fn request_count(&self) -> usize {
        self.requests.len()
    }

    pub fn remaining_requests(&self) -> usize {
        self.max_requests - self.requests.len()
    }
}
