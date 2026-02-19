use criterion::{black_box, criterion_group, criterion_main, Criterion};
use plugin_registry::prelude::*;

fn bench_plugin_lookup(c: &mut Criterion) {
    c.bench_function("plugin_lookup", |b| {
        b.iter(|| {
            // Placeholder for benchmarking
            black_box(());
        })
    });
}

criterion_group!(benches, bench_plugin_lookup);
criterion_main!(benches);
