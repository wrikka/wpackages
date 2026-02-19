//! Feature 14: Performance Profiler

use std::time::{Duration, Instant};

pub struct ProfilerRecord { pub name: String, pub duration: Duration }

pub struct Profiler { records: Vec<ProfilerRecord>, start: Option<Instant> }

impl Profiler {
    pub fn new() -> Self { Self { records: vec![], start: None } }
    pub fn start(&mut self) { self.start = Some(Instant::now()); }
    pub fn stop(&mut self, name: &str) {
        if let Some(s) = self.start.take() {
            self.records.push(ProfilerRecord { name: name.into(), duration: s.elapsed() });
        }
    }
    pub fn records(&self) -> &[ProfilerRecord] { &self.records }
}
impl Default for Profiler { fn default() -> Self { Self::new() } }
