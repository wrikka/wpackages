use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use rsui::services::focus_service::{DefaultFocusService, FocusService};
use rsui::utils::memoization::{memoize, memoize_ref, MemoCache};
use rsui::utils::throttling::RequestThrottler;
use std::time::Duration;

fn bench_memo_cache_lru(c: &mut Criterion) {
    let mut group = c.benchmark_group("memo_cache_lru");

    for size in [10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(size), size, |b, &size| {
            b.iter(|| {
                let mut cache: MemoCache<i32, i32> = MemoCache::new(size);
                for i in 0..size * 2 {
                    cache.insert(i, i * 2);
                }
                black_box(cache)
            })
        });
    }
    group.finish();
}

fn bench_memoize_vs_memoize_ref(c: &mut Criterion) {
    let mut group = c.benchmark_group("memoize_clone_vs_ref");

    group.bench_function("memoize_with_clone", |b| {
        let mut cache: MemoCache<i32, String> = MemoCache::new(100);
        b.iter(|| {
            for i in 0..100 {
                let result = memoize(&mut cache, i, || format!("value_{}", i));
                black_box(result);
            }
        })
    });

    group.bench_function("memoize_ref_no_clone", |b| {
        let mut cache: MemoCache<i32, String> = MemoCache::new(100);
        b.iter(|| {
            for i in 0..100 {
                let result = memoize_ref(&mut cache, i, || format!("value_{}", i));
                black_box(result);
            }
        })
    });

    group.finish();
}

fn bench_request_throttler_vec_vs_deque(c: &mut Criterion) {
    let mut group = c.benchmark_group("request_throttler");

    group.bench_function("vecdeque_implementation", |b| {
        let mut throttler = RequestThrottler::from_per_second(100);
        b.iter(|| {
            for _ in 0..100 {
                if throttler.can_make_request() {
                    black_box(true);
                }
            }
        })
    });

    group.finish();
}

fn bench_focus_service_read_heavy(c: &mut Criterion) {
    let mut group = c.benchmark_group("focus_service_read_heavy");

    group.bench_function("rwlock_read_operations", |b| {
        let service = DefaultFocusService::default();
        service.set_focus("button1").unwrap();

        b.iter(|| {
            for _ in 0..1000 {
                black_box(service.get_focus());
                black_box(service.is_focus_trapped());
            }
        })
    });

    group.finish();
}

fn bench_focus_service_mixed(c: &mut Criterion) {
    let mut group = c.benchmark_group("focus_service_mixed");

    group.bench_function("rwlock_mixed_operations", |b| {
        let service = DefaultFocusService::default();

        b.iter(|| {
            for i in 0..100 {
                service.set_focus(&format!("button{}", i)).unwrap();
                black_box(service.get_focus());
                black_box(service.is_focus_trapped());
            }
        })
    });

    group.finish();
}

criterion_group!(
    benches,
    bench_memo_cache_lru,
    bench_memoize_vs_memoize_ref,
    bench_request_throttler_vec_vs_deque,
    bench_focus_service_read_heavy,
    bench_focus_service_mixed
);
criterion_main!(benches);
