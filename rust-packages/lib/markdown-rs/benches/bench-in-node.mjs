import { Bench } from "tinybench";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { execa } from "execa";
import { renderGfm as markdownRsRender } from "../index.js";
import { marked } from "marked";
import MarkdownIt from "markdown-it";
import markdownItAbbr from "markdown-it-abbr";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import markdownItHighlightjs from "markdown-it-highlightjs";
import markdownItIns from "markdown-it-ins";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import markdownItTaskLists from "markdown-it-task-lists";
import * as markdownItEmoji from "markdown-it-emoji";
import { Remarkable } from "remarkable";
import showdown from "showdown";
import { format as pulldownCmarkParse } from "pulldown-cmark-wasm";
import { markdownToHTML as comrakParse } from "comrak";

const BENCHES_DIR = path.resolve(process.cwd(), "benches");
const RESULTS_FILE = path.resolve(BENCHES_DIR, "results.json");

async function runJSBenchmarks() {
	console.log("Running JavaScript benchmarks across multiple sizes...");
	const baseSample = readFileSync(
		path.resolve(BENCHES_DIR, "sample.md"),
		"utf-8",
	);
	const sizes = [1, 10]; // Multipliers for the base sample size
	const simulationData = {};

	const mdIt = new MarkdownIt()
		.use(markdownItAbbr)
		.use(markdownItAnchor)
		.use(markdownItFootnote)
		.use(markdownItHighlightjs)
		.use(markdownItIns)
		.use(markdownItMark)
		.use(markdownItSub)
		.use(markdownItSup)
		.use(markdownItTaskLists)
		.use(markdownItEmoji.full);
	const remarkable = new Remarkable();
	const showdownConverter = new showdown.Converter();

	const libraries = {
		"markdown-rs": (s) => markdownRsRender(s),
		marked: (s) => marked(s),
		"markdown-it": (s) => mdIt.render(s),
		remarkable: (s) => remarkable.render(s),
		showdown: (s) => showdownConverter.makeHtml(s),
		"pulldown-cmark-wasm": (s) => pulldownCmarkParse(s),
		comrak: (s) => comrakParse(s),
	};

	for (const size of sizes) {
		console.log(`-- Benchmarking size: ${size}x`);
		const bench = new Bench({ time: 100 });
		const sample = baseSample.repeat(size);
		const sampleSizeKB = (
			new TextEncoder().encode(sample).length / 1024
		).toFixed(2);

		for (const [name, fn] of Object.entries(libraries)) {
			bench.add(name, () => fn(sample));
		}

		await bench.run();

		bench.tasks.forEach((task) => {
			if (!simulationData[task.name]) {
				simulationData[task.name] = [];
			}
			let ops = 0;
			if (task.result && task.result.hz) {
				ops = parseFloat(task.result.hz.toFixed(2));
			} else {
				console.warn(
					`[!] Benchmark task '${task.name}' completed without a valid result. Error: ${task.error}`,
				);
			}
			simulationData[task.name].push({
				sizeKB: parseFloat(sampleSizeKB),
				ops,
			});
		});
	}

	// Get rendered output for the base size
	const rendered = Object.entries(libraries).map(([name, fn]) => ({
		name,
		html: fn(baseSample),
	}));

	// Get single performance data point for the base size for the main table
	const basePerformance = Object.entries(simulationData).map(
		([name, data]) => ({
			name,
			ops: data[0].ops,
			margin: 0, // Note: Margin is not easily available in this new setup
		}),
	);

	return { performance: basePerformance, rendered, simulation: simulationData };
}

async function runRustBenchmarks() {
	console.log("Running Rust benchmarks with 'cargo bench'...");
	try {
		// Run cargo bench, which will generate report files
		await execa("cargo", ["bench", "--bench", "bench-in-rust"], {
			stdio: "inherit",
		});

		// Find the latest benchmark report directory
		const reportDir = path.resolve(
			process.cwd(),
			"target",
			"criterion",
			"Rust Parsers",
		);
		const benchmarks = readdirSync(reportDir).filter((dir) => dir !== "report");

		const results = [];
		for (const benchName of benchmarks) {
			const estimatesPath = path.resolve(
				reportDir,
				benchName,
				"new",
				"estimates.json",
			);
			if (existsSync(estimatesPath)) {
				const estimates = JSON.parse(readFileSync(estimatesPath, "utf-8"));
				const typical_ns = estimates.mean.point_estimate;
				const ops_per_sec = 1_000_000_000 / typical_ns;
				const margin =
					((estimates.mean.upper_bound - estimates.mean.lower_bound) /
						(2 * typical_ns)) *
					100;

				results.push({
					name: benchName.replace(/_/g, " "),
					ops: parseFloat(ops_per_sec.toFixed(2)),
					margin: parseFloat(margin.toFixed(2)),
				});
			}
		}
		return results;
	} catch (error) {
		console.error("Failed to run or parse Rust benchmarks:", error.message);
		return [];
	}
}

function generateHtmlReport(data) {
	const simulationData = data.js.simulation || {};
	const renderedData = data.js.rendered || [];

	const css = `
        :root {
            --bg-color: #f8f9fa;
            --text-color: #212529;
            --card-bg: #ffffff;
            --border-color: #dee2e6;
            --primary-color: #0d6efd;
            --shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: var(--bg-color); color: var(--text-color); }
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
        h1, h2 { color: #343a40; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.5rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
        .card { background-color: var(--card-bg); border-radius: 8px; box-shadow: var(--shadow); padding: 1.5rem; overflow: hidden; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid var(--border-color); padding: 0.75rem; text-align: left; }
        th { background-color: #f1f3f5; }
        #render-container { display: flex; flex-direction: column; gap: 1rem; }
        #render-select { padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); }
        #render-output { border: 1px solid var(--border-color); padding: 1rem; background-color: #f1f3f5; border-radius: 4px; min-height: 200px; }
    `;

	const js = `
        const simulationData = ${JSON.stringify(simulationData)};
        const renderedData = ${JSON.stringify(renderedData)};

        function renderChart() {
            const ctx = document.getElementById('perfChart').getContext('2d');
            const datasets = Object.entries(simulationData).map(([name, data]) => {
                return {
                    label: name,
                    data: data.map(d => ({x: d.sizeKB, y: d.ops})),
                    fill: false,
                    tension: 0.1
                };
            });

            new Chart(ctx, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    plugins: { title: { display: true, text: 'Performance vs. File Size' } },
                    scales: {
                        x: { type: 'linear', title: { display: true, text: 'File Size (KB)' } },
                        y: { title: { display: true, text: 'Operations/sec' } }
                    }
                }
            });
        }

        function setupRenderer() {
            const select = document.getElementById('render-select');
            const output = document.getElementById('render-output');
            renderedData.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = item.name;
                select.appendChild(option);
            });

            select.addEventListener('change', (e) => {
                const selected = renderedData.find(item => item.name === e.target.value);
                output.innerHTML = selected ? selected.html : '';
            });

            // Initial render
            if (renderedData.length > 0) {
                output.innerHTML = renderedData[0].html;
            }
        }

        window.onload = () => {
            renderChart();
            setupRenderer();
        };
    `;

	let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown Benchmark & Simulation</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
        <style>${css}</style>
    </head>
    <body>
        <div class="container">
            <h1>Markdown Benchmark & Simulation</h1>
            <div class="grid">
                <div class="card">
                    <h2>Performance Simulation</h2>
                    <p>This chart shows how performance (operations/second) changes as the input file size increases.</p>
                    <canvas id="perfChart"></canvas>
                </div>
                <div class="card">
                    <h2>Live Render Output (Base Size)</h2>
                    <p>Select a library to see its rendered HTML output for the base size file.</p>
                    <div id="render-container">
                        <select id="render-select"></select>
                        <div id="render-output"></div>
                    </div>
                </div>
            </div>
            <div class="card">
                <h2>Benchmark Results (Base Size)</h2>
                ${generateTableHtml(data)}
            </div>
        </div>
        <script>${js}</script>
    </body>
    </html>`;

	writeFileSync(path.resolve(BENCHES_DIR, "results.html"), html);
	console.log(
		`HTML report generated at ${path.resolve(BENCHES_DIR, "results.html")}`,
	);
}

function generateTableHtml(data) {
	let tableHtml = "";
	for (const [_key, category] of Object.entries(data)) {
		tableHtml += `<h3>${category.name}</h3>`;
		if (category.results && category.results.length > 0) {
			tableHtml +=
				"<table><tr><th>Library</th><th>Ops/sec</th><th>Margin (±%)</th></tr>";
			const sortedResults = [...category.results].sort((a, b) => b.ops - a.ops);
			for (const result of sortedResults) {
				tableHtml += `<tr><td>${result.name}</td><td>${result.ops.toLocaleString()}</td><td>${result.margin}</td></tr>`;
			}
			tableHtml += "</table>";
		} else {
			tableHtml += "<p>No results available.</p>";
		}
	}
	return tableHtml;
}

async function main() {
	const {
		performance: jsPerformance,
		rendered: jsRendered,
		simulation: jsSimulation,
	} = await runJSBenchmarks();
	const rustResults = await runRustBenchmarks(); // Note: Rust bench doesn't support multi-size yet.

	const allResults = {
		js: {
			name: "JavaScript Markdown Parsers",
			results: jsPerformance,
			rendered: jsRendered,
			simulation: jsSimulation,
		},
		rust: {
			name: "Rust Markdown Parsers",
			results: rustResults,
		},
	};

	writeFileSync(RESULTS_FILE, JSON.stringify(allResults, null, 2));
	console.log(`All benchmark results saved to ${RESULTS_FILE}`);

	generateHtmlReport(allResults);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
