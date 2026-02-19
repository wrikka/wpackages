//! Performance benchmarks for the performance package

use criterion::{black_box, criterion_group, criterion_main, Criterion};
use performance::prelude::*;
use std::time::Instant;

fn bench_instant_measurement(c: &mut Criterion) {
    c.bench_function("instant_measurement", |b| {
        b.iter(|| {
            let start = black_box(Instant::now());
            let _elapsed = black_box(start.elapsed());
        })
    });
}

fn bench_duration_calculation(c: &mut Criterion) {
    c.bench_function("duration_calculation", |b| {
        b.iter(|| {
            let duration = black_box(Duration::from_nanos(100));
            let _as_millis = black_box(duration.as_millis());
            let _as_micros = black_box(duration.as_micros());
        })
    });
}

fn bench_error_creation(c: &mut Criterion) {
    c.bench_function("error_creation", |b| {
        b.iter(|| {
            let _error = black_box(PerformanceError::Configuration(
                "Test configuration error".to_string()
            ));
        })
    });
}

criterion_group!(
    benches,
    bench_instant_measurement,
    bench_duration_calculation,
    bench_error_creation
);
criterion_main!(benches);
