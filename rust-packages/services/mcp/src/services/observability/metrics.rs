use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricType {
    Counter,
    Gauge,
    Histogram,
    Summary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricValue {
    Counter(u64),
    Gauge(f64),
    Histogram(Vec<f64>),
    Summary { count: u64, sum: f64, min: f64, max: f64 },
}

#[derive(Debug, Clone)]
pub struct Metric {
    pub name: String,
    pub metric_type: MetricType,
    pub value: MetricValue,
    pub labels: HashMap<String, String>,
    pub timestamp: Instant,
}

#[derive(Clone)]
pub struct MetricsCollector {
    metrics: Arc<Mutex<Vec<Metric>>>,
    max_metrics: usize,
}

impl MetricsCollector {
    pub fn new(max_metrics: usize) -> Self {
        Self {
            metrics: Arc::new(Mutex::new(Vec::new())),
            max_metrics,
        }
    }

    pub fn increment_counter(&self, name: &str, value: u64, labels: HashMap<String, String>) {
        self.record_metric(Metric {
            name: name.to_string(),
            metric_type: MetricType::Counter,
            value: MetricValue::Counter(value),
            labels,
            timestamp: Instant::now(),
        });
    }

    pub fn set_gauge(&self, name: &str, value: f64, labels: HashMap<String, String>) {
        self.record_metric(Metric {
            name: name.to_string(),
            metric_type: MetricType::Gauge,
            value: MetricValue::Gauge(value),
            labels,
            timestamp: Instant::now(),
        });
    }

    pub fn record_histogram(&self, name: &str, value: f64, labels: HashMap<String, String>) {
        let mut metrics = self.metrics.lock().unwrap();
        
        let existing_metric = metrics.iter_mut().find(|m| {
            m.name == name && m.labels == labels
        });

        if let Some(metric) = existing_metric {
            if let MetricValue::Histogram(values) = &mut metric.value {
                values.push(value);
            }
        } else {
            metrics.push(Metric {
                name: name.to_string(),
                metric_type: MetricType::Histogram,
                value: MetricValue::Histogram(vec![value]),
                labels,
                timestamp: Instant::now(),
            });
        }
    }

    pub fn record_summary(&self, name: &str, value: f64, labels: HashMap<String, String>) {
        let mut metrics = self.metrics.lock().unwrap();
        
        let existing_metric = metrics.iter_mut().find(|m| {
            m.name == name && m.labels == labels
        });

        if let Some(metric) = existing_metric {
            if let MetricValue::Summary { count, sum, min, max } = &mut metric.value {
                *count += 1;
                *sum += value;
                *min = (*min).min(value);
                *max = (*max).max(value);
            }
        } else {
            metrics.push(Metric {
                name: name.to_string(),
                metric_type: MetricType::Summary,
                value: MetricValue::Summary {
                    count: 1,
                    sum: value,
                    min: value,
                    max: value,
                },
                labels,
                timestamp: Instant::now(),
            });
        }
    }

    pub fn record_timing(&self, name: &str, duration: Duration, labels: HashMap<String, String>) {
        let duration_ms = duration.as_secs_f64() * 1000.0;
        self.record_histogram(name, duration_ms, labels);
    }

    fn record_metric(&self, metric: Metric) {
        let mut metrics = self.metrics.lock().unwrap();
        
        if metrics.len() >= self.max_metrics {
            metrics.remove(0);
        }
        
        metrics.push(metric);
    }

    pub fn get_metrics(&self) -> Vec<Metric> {
        self.metrics.lock().unwrap().clone()
    }

    pub fn get_metrics_by_name(&self, name: &str) -> Vec<Metric> {
        self.metrics
            .lock()
            .unwrap()
            .iter()
            .filter(|m| m.name == name)
            .cloned()
            .collect()
    }

    pub fn clear(&self) {
        self.metrics.lock().unwrap().clear();
    }

    pub fn export_prometheus(&self) -> String {
        let metrics = self.get_metrics();
        let mut output = String::new();

        for metric in metrics {
            output.push_str(&format!("# TYPE {} {:?}\n", metric.name, metric.metric_type));
            
            let labels_str = if metric.labels.is_empty() {
                String::new()
            } else {
                let labels: Vec<String> = metric.labels
                    .iter()
                    .map(|(k, v)| format!("{}=\"{}\"", k, v))
                    .collect();
                format!("{{{}}}", labels.join(","))
            };

            match metric.value {
                MetricValue::Counter(value) => {
                    output.push_str(&format!("{}{} {}\n", metric.name, labels_str, value));
                }
                MetricValue::Gauge(value) => {
                    output.push_str(&format!("{}{} {}\n", metric.name, labels_str, value));
                }
                MetricValue::Histogram(values) => {
                    for (i, v) in values.iter().enumerate() {
                        output.push_str(&format!("{}{}[{}] {}\n", metric.name, labels_str, i, v));
                    }
                }
                MetricValue::Summary { count, sum, min, max } => {
                    output.push_str(&format!("{}{}_count {}\n", metric.name, labels_str, count));
                    output.push_str(&format!("{}{}_sum {}\n", metric.name, labels_str, sum));
                    output.push_str(&format!("{}{}_min {}\n", metric.name, labels_str, min));
                    output.push_str(&format!("{}{}_max {}\n", metric.name, labels_str, max));
                }
            }
            
            output.push('\n');
        }

        output
    }
}
