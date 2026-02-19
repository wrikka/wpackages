use criterion::{criterion_group, criterion_main, Criterion};
use std::hint::black_box;
use markdown_rs::{render, render_gfm};
use comrak::Options;

fn get_sample_markdown() -> String {
    std::fs::read_to_string("benches/sample.md").expect("Failed to read sample.md")
}

fn run_benches(c: &mut Criterion) {
    let markdown = get_sample_markdown();
    let mut group = c.benchmark_group("Rust Parsers");

    // markdown-rs
    group.bench_function("markdown-rs (safe, default)", |b| b.iter(|| render(black_box(markdown.clone()))));
    group.bench_function("markdown-rs (gfm)", |b| b.iter(|| render_gfm(black_box(markdown.clone()))));

    // comrak
    group.bench_function("comrak (GFM)", |b| {
        let mut options = Options::default();
        options.extension.strikethrough = true;
        options.extension.table = true;
        options.extension.tasklist = true;
        options.extension.footnotes = true;
        b.iter(|| comrak::markdown_to_html(black_box(&markdown), &options))
    });

    // pulldown-cmark
    group.bench_function("pulldown-cmark", |b| {
        b.iter(|| {
            let parser = pulldown_cmark::Parser::new_ext(black_box(&markdown), pulldown_cmark::Options::all());
            let mut html_output = String::new();
            pulldown_cmark::html::push_html(&mut html_output, parser);
            black_box(html_output);
        })
    });

    group.finish();
}

criterion_group!(benches, run_benches);
criterion_main!(benches);
