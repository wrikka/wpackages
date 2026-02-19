use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfilingData {
    pub function_name: String,
    pub file_path: String,
    pub line_number: usize,
    pub total_time_ns: u64,
    pub self_time_ns: u64,
    pub call_count: u64,
    pub children: Vec<ProfilingData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlameGraphNode {
    pub name: String,
    pub start: f64,
    pub duration: f64,
    pub depth: usize,
    pub children: Vec<FlameGraphNode>,
}

#[derive(Debug, Clone, Default)]
pub struct PerformanceProfilerState {
    pub profiling_data: Option<ProfilingData>,
    pub flame_graph: Option<FlameGraphNode>,
    pub is_profiling: bool,
    pub selected_function: Option<String>,
    pub view_mode: ProfilerViewMode,
    pub time_scale: TimeScale,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProfilerViewMode {
    FlameGraph,
    CallTree,
    Timeline,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum TimeScale {
    Microseconds,
    Milliseconds,
    Seconds,
}

impl PerformanceProfilerState {
    pub fn new() -> Self {
        Self {
            profiling_data: None,
            flame_graph: None,
            is_profiling: false,
            selected_function: None,
            view_mode: ProfilerViewMode::FlameGraph,
            time_scale: TimeScale::Milliseconds,
        }
    }

    pub fn start_profiling(&mut self) {
        self.is_profiling = true;
    }

    pub fn stop_profiling(&mut self, data: ProfilingData) {
        self.is_profiling = false;
        self.profiling_data = Some(data);
        self.build_flame_graph();
    }

    pub fn build_flame_graph(&mut self) {
        if let Some(data) = &self.profiling_data {
            self.flame_graph = Some(self.convert_to_flame_graph(data, 0.0, 0));
        }
    }

    fn convert_to_flame_graph(&self, data: &ProfilingData, start: f64, depth: usize) -> FlameGraphNode {
        let duration = data.total_time_ns as f64;
        let children: Vec<FlameGraphNode> = data.children.iter()
            .scan(start, |acc, child| {
                let node = self.convert_to_flame_graph(child, *acc, depth + 1);
                *acc += child.total_time_ns as f64;
                Some(node)
            })
            .collect();

        FlameGraphNode {
            name: data.function_name.clone(),
            start,
            duration,
            depth,
            children,
        }
    }

    pub fn select_function(&mut self, name: String) {
        self.selected_function = Some(name);
    }

    pub fn format_time(&self, time_ns: u64) -> String {
        match self.time_scale {
            TimeScale::Microseconds => format!("{:.2} µs", time_ns as f64 / 1000.0),
            TimeScale::Milliseconds => format!("{:.2} ms", time_ns as f64 / 1_000_000.0),
            TimeScale::Seconds => format!("{:.2} s", time_ns as f64 / 1_000_000_000.0),
        }
    }
}
