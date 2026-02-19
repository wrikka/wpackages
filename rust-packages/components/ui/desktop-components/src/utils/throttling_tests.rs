#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_throttler() {
        let mut throttler = Throttler::from_millis(100);
        
        assert!(throttler.should_execute());
        assert!(!throttler.should_execute());
        
        std::thread::sleep(Duration::from_millis(150));
        assert!(throttler.should_execute());
    }

    #[test]
    fn test_throttle() {
        let mut throttler = Throttler::from_millis(50);
        let mut call_count = 0;
        
        let executed = throttle(&mut throttler, || {
            call_count += 1;
        });
        
        assert!(executed);
        assert_eq!(call_count, 1);
        
        let executed = throttle(&mut throttler, || {
            call_count += 1;
        });
        
        assert!(!executed);
        assert_eq!(call_count, 1);
    }

    #[test]
    fn test_throttle_with_value() {
        let mut throttler = Throttler::from_millis(50);
        let mut last_value = None;
        
        let executed = throttle_with_value(&mut throttler, "test", |value| {
            last_value = Some(value.to_string());
        });
        
        assert!(executed);
        assert_eq!(last_value, Some("test".to_string()));
    }

    #[test]
    fn test_throttle_state() {
        let mut state = ThrottleState::from_millis(50);
        
        assert!(!state.is_pending());
        assert_eq!(state.get_last_value(), "");
        
        let result = state.update("test".to_string());
        assert!(result.is_some());
        assert_eq!(result, Some("test".to_string()));
        assert_eq!(state.get_last_value(), "test");
        
        let result = state.update("test2".to_string());
        assert!(result.is_none()); // Throttled
        
        std::thread::sleep(Duration::from_millis(100));
        let result = state.update("test2".to_string());
        assert!(result.is_some());
        assert_eq!(result, Some("test2".to_string()));
    }

    #[test]
    fn test_request_throttler() {
        let mut throttler = RequestThrottler::from_per_second(5);
        
        assert!(throttler.can_make_request());
        assert_eq!(throttler.request_count(), 1);
        assert_eq!(throttler.remaining_requests(), 4);
        
        for _ in 0..4 {
            assert!(throttler.can_make_request());
        }
        
        assert!(!throttler.can_make_request());
        assert_eq!(throttler.request_count(), 5);
        assert_eq!(throttler.remaining_requests(), 0);
        
        assert!(throttler.time_until_next_request().is_some());
    }

    #[test]
    fn test_calls_per_second() {
        let throttler = Throttler::from_millis(100);
        assert_eq!(throttler.calls_per_second(), 10.0);
        
        let throttler = Throttler::from_millis(50);
        assert_eq!(throttler.calls_per_second(), 20.0);
        
        let throttler = Throttler::from_millis(1000);
        assert_eq!(throttler.calls_per_second(), 1.0);
    }
}
