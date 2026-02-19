use criterion::{criterion_group, criterion_main, Criterion};
use codesearch::engine::git; 
use std::process::Command;

fn git2_blame() {
    let _ = git::blame(".", "src/main.rs", 1).unwrap();
}

fn git_cli_blame() {
    let _ = Command::new("git")
        .args(&["blame", "-L", "1,1", "src/main.rs"])
        .output()
        .unwrap();
}

fn git_benchmark(c: &mut Criterion) {
    c.bench_function("git2_blame", |b| b.iter(|| git2_blame()));
    c.bench_function("git_cli_blame", |b| b.iter(|| git_cli_blame()));
}

criterion_group!(benches, git_benchmark);
criterion_main!(benches);
