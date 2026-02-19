use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use std::time::Duration;
use tempfile::TempDir;

#[cfg(feature = "in-memory")]
use cache::InMemoryCache;

use cache::CacheConfig;
#[cfg(feature = "disk")]
use cache::DiskCache;

fn bench_in_memory_cache(c: &mut Criterion) {
    #[cfg(feature = "in-memory")]
    {
        let mut group = c.benchmark_group("in_memory_cache");

        for size in [100, 1000, 10000].iter() {
            group.bench_with_input(BenchmarkId::new("write", size), size, |b, &size| {
                let cache = InMemoryCache::<String, String>::builder()
                    .max_capacity(size)
                    .build();

                b.iter(|| {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        let value = format!("value_{}", i);
                        tokio::runtime::Runtime::new()
                            .unwrap()
                            .block_on(cache.set(key, value))
                            .unwrap();
                    }
                });
            });

            group.bench_with_input(BenchmarkId::new("read", size), size, |b, &size| {
                let cache = InMemoryCache::<String, String>::builder()
                    .max_capacity(size)
                    .build();

                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        let value = format!("value_{}", i);
                        cache.set(key, value).await.unwrap();
                    }
                });

                b.iter(|| {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        rt.block_on(cache.get(&key)).unwrap();
                    }
                });
            });
        }

        group.finish();
    }
}

fn bench_disk_cache(c: &mut Criterion) {
    #[cfg(feature = "disk")]
    {
        let mut group = c.benchmark_group("disk_cache");

        for size in [100, 1000, 10000].iter() {
            group.bench_with_input(BenchmarkId::new("write", size), size, |b, &size| {
                let temp_dir = TempDir::new().unwrap();
                let path = temp_dir
                    .path()
                    .join("cache.db")
                    .to_str()
                    .unwrap()
                    .to_string();
                let cache = DiskCache::<String, String>::builder()
                    .path(path)
                    .build()
                    .unwrap();

                b.iter(|| {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        let value = format!("value_{}", i);
                        tokio::runtime::Runtime::new()
                            .unwrap()
                            .block_on(cache.set(key, value))
                            .unwrap();
                    }
                });
            });

            group.bench_with_input(BenchmarkId::new("read", size), size, |b, &size| {
                let temp_dir = TempDir::new().unwrap();
                let path = temp_dir
                    .path()
                    .join("cache.db")
                    .to_str()
                    .unwrap()
                    .to_string();
                let cache = DiskCache::<String, String>::builder()
                    .path(path)
                    .build()
                    .unwrap();

                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        let value = format!("value_{}", i);
                        cache.set(key, value).await.unwrap();
                    }
                });

                b.iter(|| {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        rt.block_on(cache.get(&key)).unwrap();
                    }
                });
            });
        }

        group.finish();
    }
}

fn bench_comparison(c: &mut Criterion) {
    #[cfg(all(feature = "in-memory", feature = "disk"))]
    {
        let mut group = c.benchmark_group("cache_comparison");

        for size in [100, 1000].iter() {
            group.bench_with_input(
                BenchmarkId::new("in_memory_write", size),
                size,
                |b, &size| {
                    let cache = InMemoryCache::<String, String>::builder()
                        .max_capacity(size)
                        .build();

                    b.iter(|| {
                        for i in 0..size {
                            let key = format!("key_{}", i);
                            let value = format!("value_{}", i);
                            tokio::runtime::Runtime::new()
                                .unwrap()
                                .block_on(cache.set(key, value))
                                .unwrap();
                        }
                    });
                },
            );

            group.bench_with_input(BenchmarkId::new("disk_write", size), size, |b, &size| {
                let temp_dir = TempDir::new().unwrap();
                let path = temp_dir
                    .path()
                    .join("cache.db")
                    .to_str()
                    .unwrap()
                    .to_string();
                let cache = DiskCache::<String, String>::builder()
                    .path(path)
                    .build()
                    .unwrap();

                b.iter(|| {
                    for i in 0..size {
                        let key = format!("key_{}", i);
                        let value = format!("value_{}", i);
                        tokio::runtime::Runtime::new()
                            .unwrap()
                            .block_on(cache.set(key, value))
                            .unwrap();
                    }
                });
            });
        }

        group.finish();
    }
}

criterion_group!(
    benches,
    bench_in_memory_cache,
    bench_disk_cache,
    bench_comparison
);
criterion_main!(benches);
