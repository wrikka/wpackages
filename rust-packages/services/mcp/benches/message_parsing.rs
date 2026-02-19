use criterion::{black_box, criterion_group, criterion_main, Criterion};
use mcp::prelude::*;

fn bench_message_parsing(c: &mut Criterion) {
    c.bench_function("message_parsing", |b| {
        b.iter(|| {
            // Placeholder for benchmarking
            black_box(());
        })
    });
}

criterion_group!(benches, bench_message_parsing);
criterion_main!(benches);
