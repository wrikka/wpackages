//! Performance profiling utilities
//! 
//! Provides tools for measuring and analyzing performance

use std::time::{Duration, Instant};

/// Performance profiler for measuring execution time
pub struct Profiler {
    measurements: Vec<(&'static str, Duration)>,
    current: Option<(&'static str, Instant)>,
}

impl Profiler {
    /// Create a new profiler
    pub fn new() -> Self {
        Self {
            measurements: Vec::new(),
            current: None,
        }
    }

    /// Start measuring a section
    pub fn start(&mut self, name: &'static str) {
        self.current = Some((name, Instant::now()));
    }

    /// Stop measuring and record the duration
    pub fn stop(&mut self) {
        if let Some((name, start)) = self.current.take() {
            let duration = start.elapsed();
            self.measurements.push((name, duration));
        }
    }

    /// Get all measurements
    pub fn measurements(&self) -> &[(&'static str, Duration)] {
        &self.measurements
    }

    /// Get total duration
    pub fn total_duration(&self) -> Duration {
        self.measurements.iter().map(|(_, d)| d).sum()
    }

    /// Print summary
    pub fn print_summary(&self) {
        println!("Performance Profile:");
        println!("Total: {:?}", self.total_duration());
        for (name, duration) in &self.measurements {
            println!("  {}: {:?}", name, duration);
        }
    }
}

impl Default for Profiler {
    fn default() -> Self {
        Self::new()
    }
}

/// Scoped profiler that automatically stops when dropped
pub struct ScopedProfiler<'a> {
    profiler: &'a mut Profiler,
}

impl<'a> ScopedProfiler<'a> {
    /// Create a new scoped profiler
    pub fn new(profiler: &'a mut Profiler, name: &'static str) -> Self {
        profiler.start(name);
        Self { profiler }
    }
}

impl<'a> Drop for ScopedProfiler<'a> {
    fn drop(&mut self) {
        self.profiler.stop();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;

    #[test]
    fn test_profiler() {
        let mut profiler = Profiler::new();
        
        profiler.start("test");
        thread::sleep(Duration::from_millis(10));
        profiler.stop();
        
        assert_eq!(profiler.measurements().len(), 1);
        assert!(profiler.measurements()[0].1 >= Duration::from_millis(10));
    }

    #[test]
    fn test_scoped_profiler() {
        let mut profiler = Profiler::new();
        {
            let _scoped = ScopedProfiler::new(&mut profiler, "scoped");
            thread::sleep(Duration::from_millis(10));
        }
        
        assert_eq!(profiler.measurements().len(), 1);
    }
}
