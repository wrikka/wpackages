/**
 * Test runner for @wpackages/schema
 */

console.log('🧪 Running test suite...');

async function runTests() {
	try {
		// Run test suite
		const testProcess = Bun.spawn(['bun', 'run', 'test'], {
			stdout: 'inherit',
			stderr: 'inherit',
		});

		await new Promise((resolve, reject) => {
			testProcess.on('exit', (code) => {
				if (code === 0) {
					console.log('✅ All tests passed');
					resolve(code);
				} else {
					console.error('❌ Tests failed');
					reject(new Error(`Tests failed with code ${code}`));
				}
			});
		});
	} catch (error) {
		console.error('❌ Test run failed:', error.message);
		process.exit(1);
	}
}

runTests();
