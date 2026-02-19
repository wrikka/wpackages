import { execSync } from "child_process";
import fs from "fs/promises";
import { createRequire } from "module";
import FlexSearch from "flexsearch";
import { MeiliSearch } from "meilisearch";
import lunr from "lunr";

const require = createRequire(import.meta.url);
const { NapiIndex } = require("../index.cjs");

// --- From dataset.mjs ---
function sfc32(a, b, c, d) {
	return function () {
		a |= 0;
		b |= 0;
		c |= 0;
		d |= 0;
		var t = (((a + b) | 0) + d) | 0;
		d = (d + 1) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};
}
const rand = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, 0x81994211);
const WORDS = [
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
	"rust",
	"search",
	"performance",
	"benchmark",
	"fast",
	"document",
	"indexing",
	"query",
	"result",
	"flexsearch",
	"tantivy",
	"meilisearch",
	"wdocs",
	"javascript",
	"typescript",
	"database",
	"algorithm",
	"optimization",
];
function getRandomWord() {
	return WORDS[Math.floor(rand() * WORDS.length)];
}
function generateSentence(wordCount) {
	let sentence = "";
	for (let i = 0; i < wordCount; i++) {
		sentence += getRandomWord() + " ";
	}
	return sentence.trim() + ".";
}
function generateParagraph(sentenceCount) {
	let paragraph = "";
	for (let i = 0; i < sentenceCount; i++) {
		paragraph += generateSentence(Math.floor(rand() * 10) + 5) + " ";
	}
	return paragraph.trim();
}
function createDocs(count) {
	const docs = [];
	for (let i = 0; i < count; i++) {
		docs.push({
			id: i.toString(),
			title: generateSentence(5),
			body: generateParagraph(3),
		});
	}
	return docs;
}

// --- From node_bench.js ---
async function benchWdocsSearch(docs, searchTerm) {
	console.log("Benchmarking wdocs-search (N-API)...");
	const index = new NapiIndex();
	const startIndexing = performance.now();
	index.addDocuments(
		docs.map((d) => ({ fields: { title: d.title, body: d.body } })),
	);
	index.buildIndex();
	const endIndexing = performance.now();
	const startSearch = performance.now();
	index.search(searchTerm);
	const endSearch = performance.now();
	return {
		indexing: endIndexing - startIndexing,
		search: endSearch - startSearch,
	};
}
async function benchFlexSearch(docs, searchTerm) {
	console.log("Benchmarking FlexSearch...");
	const index = new FlexSearch.Document({
		document: {
			id: "id",
			index: ["title", "body"],
		},
	});
	const startIndexing = performance.now();
	docs.forEach((doc) => index.add(doc));
	const endIndexing = performance.now();
	const startSearch = performance.now();
	index.search(searchTerm);
	const endSearch = performance.now();
	return {
		indexing: endIndexing - startIndexing,
		search: endSearch - startSearch,
	};
}
async function benchLunr(docs, searchTerm) {
	console.log("Benchmarking Lunr...");
	const startIndexing = performance.now();
	const idx = lunr(function () {
		this.ref("id");
		this.field("title");
		this.field("body");
		docs.forEach(function (doc) {
			this.add(doc);
		}, this);
	});
	const endIndexing = performance.now();
	const startSearch = performance.now();
	idx.search(searchTerm);
	const endSearch = performance.now();
	return {
		indexing: endIndexing - startIndexing,
		search: endSearch - startSearch,
	};
}

async function runNodeBenchmarks(docs, searchTerm) {
	const results = {};
	results["wdocs-search"] = await benchWdocsSearch(docs, searchTerm);
	results["flexsearch"] = await benchFlexSearch(docs, searchTerm);
	results["lunr"] = await benchLunr(docs, searchTerm);
	console.table(results);
	return results;
}

// --- From report.mjs ---
async function generateReport(results) {
	await fs.writeFile("benches/results.json", JSON.stringify(results, null, 2));

	const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Search Benchmark Results</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f8f9fa; color: #212529; }
            .container { max-width: 1200px; margin: 40px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1, h2 { text-align: center; color: #343a40; }
            .chart-container { display: flex; flex-wrap: wrap; justify-content: space-around; gap: 20px; margin-top: 30px; }
            .chart { flex: 1 1 45%; min-width: 300px; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            canvas { max-width: 100%; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Search Benchmark Results</h1>
            <div class="chart-container">
                <div class="chart">
                    <h2>Indexing Time (ms) - Lower is Better</h2>
                    <canvas id="indexingChart"></canvas>
                </div>
                <div class="chart">
                    <h2>Search Time (ms) - Lower is Better</h2>
                    <canvas id="searchChart"></canvas>
                </div>
            </div>
        </div>
        <script>
            (async () => {
                const data = ${JSON.stringify(results)};

                // --- Indexing Chart ---
                const indexingCtx = document.getElementById('indexingChart').getContext('2d');
                const indexingLabels = Object.keys(data.node).filter(k => data.node[k].indexing > 0);
                if (data.rust['wdocs-search'] && data.rust['wdocs-search'].indexing) {
                    indexingLabels.unshift('wdocs-search (Rust)');
                }
                 if (data.rust['tantivy'] && data.rust['tantivy'].indexing) {
                    indexingLabels.unshift('tantivy (Rust)');
                }

                const indexingData = Object.values(data.node).filter(v => v.indexing > 0).map(v => v.indexing);
                 if (data.rust['wdocs-search'] && data.rust['wdocs-search'].indexing) {
                    indexingData.unshift(data.rust['wdocs-search'].indexing);
                }
                if (data.rust['tantivy'] && data.rust['tantivy'].indexing) {
                    indexingData.unshift(data.rust['tantivy'].indexing);
                }

                new Chart(indexingCtx, {
                    type: 'bar',
                    data: {
                        labels: indexingLabels.map(l => {
                            if (['wdocs-search (Rust)', 'tantivy (Rust)', 'minisearch (Rust)'].includes(l)) return l;
                            return l.replace('-',' ') + ' (Node.js)';
                        }),
                        datasets: [{
                            label: 'Indexing Time (ms)',
                            data: indexingData,
                            backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
                            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                            borderWidth: 1
                        }]
                    },
                    options: { scales: { y: { beginAtZero: true, type: 'logarithmic' } } }
                });

                // --- Search Chart ---
                const searchCtx = document.getElementById('searchChart').getContext('2d');
                const searchLabels = [...Object.keys(data.node), 'ripgrep'];
                if (data.rust['wdocs-search'] && data.rust['wdocs-search'].search) {
                    searchLabels.unshift('wdocs-search (Rust)');
                }
                if (data.rust['tantivy'] && data.rust['tantivy'].search) {
                    searchLabels.unshift('tantivy (Rust)');
                }
                
                const searchData = [...Object.values(data.node).map(v => v.search), data.ripgrep.search];
                if (data.rust['wdocs-search'] && data.rust['wdocs-search'].search) {
                    searchData.unshift(data.rust['wdocs-search'].search);
                }
                if (data.rust['tantivy'] && data.rust['tantivy'].search) {
                    searchData.unshift(data.rust['tantivy'].search);
                }

                new Chart(searchCtx, {
                    type: 'bar',
                    data: {
                        labels: searchLabels.map(l => {
                             if (['wdocs-search (Rust)', 'tantivy (Rust)', 'minisearch (Rust)', 'ripgrep'].includes(l)) return l;
                            return l.replace('-',' ') + ' (Node.js)';
                        }),
                        datasets: [{
                            label: 'Search Time (ms)',
                            data: searchData,
                            backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(201, 203, 207, 0.5)'],
                            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(201, 203, 207, 1)'],
                            borderWidth: 1
                        }]
                    },
                    options: { scales: { y: { beginAtZero: true, type: 'logarithmic' } } }
                });
            })();
        </script>
    </body>
    </html>`;
	await fs.writeFile("benches/results.html", htmlContent);
}

// --- Main script from run.mjs ---
const DATASET_PATH = "benches/dataset.json";
const RIPGREP_TARGET_PATH = "benches/ripgrep_target.txt";
const SEARCH_TERM = "rust";

async function main() {
	try {
		const results = {};

		console.log("--- Generating Dataset ---");
		const docs = createDocs(10000);
		await fs.writeFile(DATASET_PATH, JSON.stringify(docs));
		const ripgrepContent = docs.map((d) => `${d.title} ${d.body}`).join("\n");
		await fs.writeFile(RIPGREP_TARGET_PATH, ripgrepContent);
		console.log("Dataset generated.");

		console.log("\n--- Running Rust Benchmarks (Criterion) ---");
		try {
			execSync("cargo bench", { stdio: "inherit" });
			const rustBenchDir = "target/criterion";
			const rustResults = {};
			const benchmarkFolders = (
				await fs.readdir(rustBenchDir, { withFileTypes: true })
			)
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name);

			for (const folder of benchmarkFolders) {
				const rawJsonPath = `${rustBenchDir}/${folder}/new/raw.json`;
				try {
					const rawJsonl = await fs.readFile(rawJsonPath, "utf-8");
					for (const line of rawJsonl.trim().split("\n")) {
						const data = JSON.parse(line);
						if (data.reason === "benchmark-complete") {
							const benchName = data.id.id;
							const meanTimeNs = data.mean.estimate;
							const meanTimeMs = meanTimeNs / 1_000_000;
							const [lib, key] = benchName.split(":").map((s) => s.trim());
							if (!rustResults[lib]) rustResults[lib] = {};
							rustResults[lib][key] = meanTimeMs;
						}
					}
				} catch (e) {
					if (e.code !== "ENOENT") {
						console.warn(`Could not read or parse ${rawJsonPath}:`, e);
					}
				}
			}
			results.rust = rustResults;
			console.log("Rust benchmark results:", results.rust);
		} catch (e) {
			console.error("Failed to run or parse Rust benchmarks:", e);
			results.rust = {};
		}

		console.log("\n--- Running Node.js Benchmarks ---");
		results.node = await runNodeBenchmarks(docs, SEARCH_TERM);

		console.log("\n--- Running Ripgrep Benchmark ---");
		const startRg = performance.now();
		execSync(`rg -c ${SEARCH_TERM} ${RIPGREP_TARGET_PATH}`);
		const endRg = performance.now();
		results.ripgrep = { search: endRg - startRg };
		console.log(`Ripgrep search took ${results.ripgrep.search.toFixed(2)}ms`);

		console.log("\n--- Generating HTML Report ---");
		await generateReport(results);
		console.log("Report generated at benches/results.html");

		await fs.unlink(DATASET_PATH);
		await fs.unlink(RIPGREP_TARGET_PATH);
	} catch (e) {
		console.error("Benchmark script failed:", e);
	}
}

main().catch(console.error);
