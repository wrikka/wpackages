import type { BenchmarkResult, ComparisonResult } from "../types";
import { ConsoleService } from "./console.service";

// Type guard to check if the result is a ComparisonResult
const isComparisonResult = (result: any): result is ComparisonResult => {
	return result && Array.isArray(result.results);
};

const generateHtml = (data: BenchmarkResult | ComparisonResult): string => {
	const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 2em; background-color: #f8f9fa; color: #212529; }
    h1, h2 { color: #343a40; border-bottom: 2px solid #dee2e6; padding-bottom: 0.3em;}
    table { width: 100%; border-collapse: collapse; margin-top: 1.5em; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
    th, td { padding: 0.8em; text-align: left; border-bottom: 1px solid #dee2e6; }
    th { background-color: #e9ecef; }
    tbody tr:hover { background-color: #f1f3f5; }
    .container { max-width: 1000px; margin: auto; background-color: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .card { border: 1px solid #dee2e6; border-radius: 4px; padding: 1.5em; margin-bottom: 1em; background-color: #fff; }
    .fastest { color: #28a745; font-weight: bold; }
    .slowest { color: #dc3545; font-weight: bold; }
    code { background-color: #e9ecef; padding: 0.2em 0.4em; border-radius: 3px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;}
  `;

	let bodyContent = "";

	if (isComparisonResult(data)) {
		bodyContent = `
      <h2>Benchmark Comparison</h2>
      <p><strong>Fastest:</strong> <span class="fastest">${data.fastest}</span></p>
      <p><strong>Slowest:</strong> <span class="slowest">${data.slowest}</span></p>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Mean (ms)</th>
            <th>Median (ms)</th>
            <th>Min (ms)</th>
            <th>Max (ms)</th>
            <th>StdDev</th>
            <th>CPU (User)</th>
            <th>Memory (Max RSS)</th>
            <th>p-value</th>
            <th>Speedup</th>
          </tr>
        </thead>
        <tbody>
          ${
			data.results.map(res => `
            <tr>
              <td><code>${res.command}</code></td>
              <td>${res.mean.toFixed(2)}</td>
              <td>${res.median.toFixed(2)}</td>
              <td>${res.min.toFixed(2)}</td>
              <td>${res.max.toFixed(2)}</td>
              <td>${res.stddev.toFixed(2)}</td>
              <td>${res.cpuUserMs.toFixed(2)} ms</td>
              <td>${(res.maxRssBytes / 1024 / 1024).toFixed(2)} MB</td>
              <td>${res.command === data.fastest ? "-" : data.pValues?.[res.command]?.toFixed(3) ?? "N/A"}</td>
              <td>${(data.speedups[res.command] ?? 1).toFixed(2)}x</td>
            </tr>
          `).join("")
		}
        </tbody>
      </table>
      ${
			data.results.map(res => `
		  <h3>${res.command} - Time Distribution</h3>
		  <div style="display: flex; gap: 2em; align-items: flex-start;">
			  ${generateHistogramSvg(res)}
			  ${generateBoxPlotSvg(res)}
		  </div>
	  `).join("")
		}
    `;
	} else {
		const res = data as BenchmarkResult;
		bodyContent = `
      <h2>Benchmark Result</h2>
      <div class="card">
        <p><strong>Command:</strong> <code>${res.command}</code></p>
        <p><strong>Total Runs:</strong> ${res.runs}</p>
        <p><strong>Mean:</strong> ${res.mean.toFixed(2)} ms</p>
        <p><strong>Median:</strong> ${res.median.toFixed(2)} ms</p>
        <p><strong>Min:</strong> ${res.min.toFixed(2)} ms</p>
        <p><strong>Max:</strong> ${res.max.toFixed(2)} ms</p>
        <p><strong>Standard Deviation:</strong> ${res.stddev.toFixed(2)}</p>
        <p><strong>CPU (User):</strong> ${res.cpuUserMs.toFixed(2)} ms</p>
        <p><strong>Memory (Max RSS):</strong> ${(res.maxRssBytes / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    `;
	}

	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Benchmark Report</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="container">
        <h1>Benchmark Report</h1>
        <p>Generated on: ${new Date().toUTCString()}</p>
        ${bodyContent}
      </div>
    </body>
    </html>
  `;
};

export const generateReport = async (data: BenchmarkResult | ComparisonResult, outputPath: string) => {
	try {
		const htmlContent = generateHtml(data);
		await Bun.write(outputPath, htmlContent);
		await ConsoleService.success(`\n✓ HTML report generated at ${outputPath}`);
	} catch (error) {
		if (error instanceof Error) {
			await ConsoleService.error(`Failed to generate HTML report: ${error.message}`);
		}
	}
};

const generateHistogramSvg = (result: BenchmarkResult): string => {
	const { times } = result;
	const width = 400, height = 200, margin = { top: 10, right: 10, bottom: 30, left: 40 };
	const min = Math.min(...times);
	const max = Math.max(...times);
	const numBins = 10;
	const binWidth = (max - min) / numBins;
	const bins = Array(numBins).fill(0);

	for (const time of times) {
		let binIndex = Math.floor((time - min) / binWidth);
		if (binIndex === numBins) binIndex--;
		bins[binIndex]++;
	}

	const maxFreq = Math.max(...bins, 1);
	const xScale = (width - margin.left - margin.right) / numBins;
	const yScale = (height - margin.top - margin.bottom) / maxFreq;

	const bars = bins.map((freq, i) => {
		const barHeight = freq * yScale;
		const x = margin.left + i * xScale;
		const y = height - margin.bottom - barHeight;
		return `<rect x="${x}" y="${y}" width="${xScale - 1}" height="${barHeight}" fill="#6c757d"></rect>`;
	}).join("");

	const xLabels = bins.map((_, i) => {
		const x = margin.left + i * xScale + (xScale / 2);
		const y = height - margin.bottom + 15;
		const label = (min + i * binWidth).toFixed(1);
		return `<text x="${x}" y="${y}" font-size="10" text-anchor="middle">${label}</text>`;
	}).join("");

	return `
		<svg width="${width}" height="${height}" style="border: 1px solid #dee2e6; border-radius: 4px;">
			${bars}
			<line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${
		height - margin.bottom
	}" stroke="#343a40"></line>
			<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${
		height - margin.bottom
	}" stroke="#343a40"></line>
            ${xLabels}
			<text x="${width / 2}" y="${height - 5}" font-size="12" text-anchor="middle">Time (ms)</text>
		</svg>
	`;
};

const generateBoxPlotSvg = (result: BenchmarkResult): string => {
	const { p25, p50: median, p75 } = result.percentiles;
	const { min, max } = result;
	const width = 400, height = 100, margin = { top: 20, right: 20, bottom: 20, left: 20 };
	const range = max - min;

	if (range === 0) return "<p>Box plot not available (all values are the same).</p>";

	const scale = (val: number) => margin.left + ((val - min) / range) * (width - margin.left - margin.right);

	const minPos = scale(min);
	const p25Pos = scale(p25);
	const medianPos = scale(median);
	const p75Pos = scale(p75);
	const maxPos = scale(max);

	const boxWidth = p75Pos - p25Pos;
	const midY = height / 2;

	return `
		<svg width="${width}" height="${height}" style="border: 1px solid #dee2e6; border-radius: 4px;">
			<line x1="${minPos}" y1="${midY}" x2="${p25Pos}" y2="${midY}" stroke="#343a40"></line>
			<line x1="${p75Pos}" y1="${midY}" x2="${maxPos}" y2="${midY}" stroke="#343a40"></line>
			<rect x="${p25Pos}" y="${midY - 15}" width="${boxWidth}" height="30" fill="#e9ecef" stroke="#343a40"></rect>
			<line x1="${medianPos}" y1="${midY - 15}" x2="${medianPos}" y2="${
		midY + 15
	}" stroke="#dc3545" stroke-width="2"></line>
			<line x1="${minPos}" y1="${midY - 8}" x2="${minPos}" y2="${midY + 8}" stroke="#343a40"></line>
			<line x1="${maxPos}" y1="${midY - 8}" x2="${maxPos}" y2="${midY + 8}" stroke="#343a40"></line>
			<text x="${minPos}" y="${midY + 30}" font-size="10" text-anchor="middle">${min.toFixed(1)}</text>
			<text x="${medianPos}" y="${midY - 25}" font-size="10" text-anchor="middle">${median.toFixed(1)}</text>
			<text x="${maxPos}" y="${midY + 30}" font-size="10" text-anchor="middle">${max.toFixed(1)}</text>
		</svg>
	`;
};
