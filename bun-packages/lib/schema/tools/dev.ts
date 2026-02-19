/**
 * Development tools for @wpackages/schema
 */

import { runBenchmarkSuite } from '../src/lib/benchmark';

/**
 * Run performance benchmarks
 */
export async function benchmark() {
	console.log('🚀 Running @wpackages/schema benchmarks...\n');
	
	const results = runBenchmarkSuite();
	
	console.log('\n📊 Benchmark Results:');
	console.log(`Average ops/sec: ${results.opsPerSecond.toLocaleString()}`);
	console.log(`Bundle size target: < 3KB`);
	
	return results;
}

/**
 * Bundle size analyzer
 */
export async function analyzeBundle() {
	try {
		const stats = await Bun.file('./dist/index.js').text();
		const sizeKB = (new Blob([stats]).size / 1024).toFixed(2);
		
		console.log(`📦 Current bundle size: ${sizeKB}KB`);
		
		if (parseFloat(sizeKB) <= 3) {
			console.log('✅ Bundle size target achieved!');
		} else {
			console.log(`⚠️  Bundle size ${(parseFloat(sizeKB) - 3).toFixed(2)}KB over target`);
		}
		
		return parseFloat(sizeKB);
	} catch {
		console.log('❌ Build not found. Run build first.');
		return null;
	}
}

/**
 * Development server for testing
 */
export async function dev() {
	console.log('🔧 Starting development server...');
	
	const server = Bun.serve({
		port: 3000,
		async fetch(req) {
			const url = new URL(req.url);
			
			if (url.pathname === '/benchmark') {
				const results = await runBenchmarkSuite();
				return new Response(JSON.stringify(results, null, 2), {
					headers: { 'Content-Type': 'application/json' },
				});
			}
			
			if (url.pathname === '/analyze') {
				const size = await analyzeBundle();
				return new Response(JSON.stringify({ sizeKB: size }), {
					headers: { 'Content-Type': 'application/json' },
				});
			}
			
			// Serve static files
			try {
				const file = Bun.file(`.${url.pathname}`);
				return new Response(file);
			} catch {
				return new Response('Not found', { status: 404 });
			}
		},
	});
	
	console.log('🌐 Dev server running at http://localhost:3000');
	console.log('📊 Benchmark: http://localhost:3000/benchmark');
	console.log('📦 Bundle analysis: http://localhost:3000/analyze');
	
	return server;
}
