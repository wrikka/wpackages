use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use meilisearch_sdk::client::*;
use meilisearch_sdk::document::*;
use meilisearch_sdk::search::*;
use search::app::index::Index;
use search::types::document::Document;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::hint::black_box;
use std::process::{Child, Command};
use std::time::Duration;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::{Schema, STORED, TEXT};
use tantivy::{doc, Index as TantivyIndex};
use tokio::runtime::Runtime;
use tokio::time::sleep;

fn load_dataset() -> Vec<Document> {
    let data = fs::read_to_string("benches/dataset.json").expect("Failed to read dataset");
    let json: Vec<serde_json::Value> =
        serde_json::from_str(&data).expect("Failed to parse dataset");

    json.into_iter()
        .enumerate()
        .map(|(i, val)| {
            let mut fields = HashMap::new();
            fields.insert(
                "title".to_string(),
                val["title"].as_str().unwrap().to_string(),
            );
            fields.insert(
                "body".to_string(),
                val["body"].as_str().unwrap().to_string(),
            );
            Document {
                id: i as u64,
                fields,
            }
        })
        .collect()
}

fn wdocs_search_benchmark(c: &mut Criterion) {
    let docs = load_dataset();
    let mut group = c.benchmark_group("Rust Benchmarks");

    group.bench_function("wdocs-search: indexing", |b| {
        b.iter(|| {
            let mut index = Index::new();
            index.add_documents(docs.clone());
            index.build();
        });
    });

    let mut index = Index::new();
    index.add_documents(docs);
    index.build();

    group.bench_function("wdocs-search: search", |b| {
        b.iter(|| index.search(black_box("rust")));
    });

    group.bench_function("wdocs-search: search multi-word", |b| {
        b.iter(|| index.search(black_box("rust programming")))
    });

    group.bench_function("wdocs-search: search_ids", |b| {
        b.iter(|| index.search_ids(black_box("rust")))
    });

    group.finish();
}

fn tantivy_benchmark(c: &mut Criterion) {
    let docs = load_dataset();
    let mut group = c.benchmark_group("Rust Benchmarks");

    let mut schema_builder = Schema::builder();
    let title = schema_builder.add_text_field("title", TEXT | STORED);
    let body = schema_builder.add_text_field("body", TEXT);
    let schema = schema_builder.build();

    // Minisearch benchmark
    group.bench_function("minisearch: indexing", |b| {
        b.iter(|| {
            let mut minisearch_index = minisearch::Index::new(vec!["title", "body"]);
            minisearch_index.add_documents(docs.clone());
        });
    });

    let mut minisearch_index = minisearch::Index::new(vec!["title", "body"]);
    minisearch_index.add_documents(docs.clone());
    group.bench_function("minisearch: search", |b| {
        b.iter(|| {
            minisearch_index.search("rust");
        });
    });

    group.bench_function("tantivy: indexing", |b| {
        b.iter(|| {
            let index = TantivyIndex::create_in_ram(schema.clone());
            let mut index_writer = index.writer(50_000_000).unwrap();
            for (_i, doc) in docs.iter().enumerate() {
                index_writer
                    .add_document(doc! {
                        title => doc.fields.get("title").unwrap().as_str(),
                        body => doc.fields.get("body").unwrap().as_str()
                    })
                    .unwrap();
            }
            index_writer.commit().unwrap();
        });
    });

    let index = TantivyIndex::create_in_ram(schema.clone());
    let mut index_writer = index.writer(50_000_000).unwrap();
    for doc in &docs {
        index_writer
            .add_document(doc! {
                title => doc.fields.get("title").unwrap().as_str(),
                body => doc.fields.get("body").unwrap().as_str()
            })
            .unwrap();
    }
    index_writer.commit().unwrap();
    let reader = index.reader().unwrap();
    let searcher = reader.searcher();
    let query_parser = QueryParser::for_index(&index, vec![title, body]);

    group.bench_function("tantivy: search", |b| {
        b.iter(|| {
            let query = query_parser.parse_query(black_box("rust")).unwrap();
            searcher.search(&query, &TopDocs::with_limit(10)).unwrap();
        });
    });

    group.finish();
}

fn tokenizer_benchmark(c: &mut Criterion) {
    let docs = load_dataset();
    let tokenizer = search::components::tokenizer::Tokenizer::new();
    let text_to_tokenize: String = docs
        .iter()
        .map(|d| {
            d.fields
                .values()
                .cloned()
                .collect::<Vec<String>>()
                .join(" ")
        })
        .collect::<Vec<String>>()
        .join(" ");

    c.bench_function("wdocs-search: tokenizer", |b| {
        b.iter(|| tokenizer.tokenize(black_box(&text_to_tokenize)))
    });
}

criterion_group!(
    benches,
    wdocs_search_benchmark,
    tantivy_benchmark,
    tokenizer_benchmark
);
fn meilisearch_benchmark(c: &mut Criterion) {
    // Start Meilisearch instance
    let mut meili_server = Command::new("./benches/bin/meilisearch.exe")
        .arg("--master-key=masterKey")
        .arg("--no-analytics")
        .spawn()
        .expect("Failed to start Meilisearch");

    // Wait for Meilisearch to be ready
    sleep(Duration::from_secs(2));

    let rt = Runtime::new().unwrap();
    rt.block_on(async {
        let client = Client::new("http://localhost:7700", Some("masterKey"));
        let docs = load_dataset_for_meili();
        let index = client.index(format!("movies_{}", rand::random::<u32>()));

        let mut group = c.benchmark_group("meilisearch");

        group.bench_function("indexing", |b| {
            b.to_async(&rt).iter(|| async {
                let task = index.add_documents(&docs, Some("id")).await.unwrap();
                index
                    .wait_for_task(task.task_uid, None, None)
                    .await
                    .unwrap();
            });
        });

        group.bench_function("search", |b| {
            b.to_async(&rt).iter(|| async {
                index
                    .search()
                    .with_query("rust")
                    .execute::<MeiliDocument>()
                    .await
                    .unwrap();
            });
        });

        group.finish();
    });

    meili_server.kill().expect("Failed to kill Meilisearch");
}

#[derive(Serialize, Deserialize, Debug)]
struct MeiliDocument {
    id: u64,
    title: String,
    body: String,
}

impl Document for MeiliDocument {
    type UID = u64;
    fn get_uid(&self) -> &Self::UID {
        &self.id
    }
}

fn load_dataset_for_meili() -> Vec<MeiliDocument> {
    let json_str = fs::read_to_string("benches/dataset.json").expect("Failed to read dataset");
    let docs: Vec<Document> = serde_json::from_str(&json_str).expect("Failed to parse dataset");
    docs.into_iter()
        .map(|d| MeiliDocument {
            id: d.id,
            title: d.fields.get("title").cloned().unwrap_or_default(),
            body: d.fields.get("body").cloned().unwrap_or_default(),
        })
        .collect()
}

criterion_main!(benches, meilisearch_benchmark);
