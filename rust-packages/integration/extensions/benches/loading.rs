use criterion::{black_box, criterion_group, criterion_main, Criterion};
use extensions::prelude::*;

fn bench_extension_loading(c: &mut Criterion) {
    c.bench_function("extension_loading", |b| {
        b.iter(|| {
            // Placeholder for benchmarking
            black_box(());
        })
    });
}

criterion_group!(benches, bench_extension_loading);
criterion_main!(benches);
