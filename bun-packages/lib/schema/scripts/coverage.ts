/**
 * Test coverage for @wpackages/schema
 */

console.log('📊 Running test coverage...');

async function runCoverage() {
	try {
		// Run test coverage
		const coverageProcess = Bun.spawn(['bun', 'run', 'test:coverage'], {
			stdout: 'inherit',
			stderr: 'inherit',
		});

		await new Promise<void>((resolve, reject) => {
			coverageProcess.on('exit', (code) => {
				if (code === 0) {
					console.log('✅ Coverage report generated');
					resolve();
				} else {
					console.error('❌ Coverage failed');
					reject(new Error(`Coverage failed with code ${code}`));
				}
			});
		});
	} catch (error) {
		console.error('❌ Coverage run failed:', error.message);
		process.exit(1);
	}
}

void runCoverage();
