/**
 * Lint check for @wpackages/schema
 */

console.log('🔍 Running lint checks...');

async function runLint() {
	try {
		// Run TypeScript type checking
		console.log('📝 TypeScript type checking...');
		const tscProcess = Bun.spawn(['bun', 'run', 'lint'], {
			stdout: 'inherit',
			stderr: 'inherit',
		});

		await new Promise((resolve, reject) => {
			tscProcess.on('exit', (code) => {
				if (code === 0) {
					console.log('✅ TypeScript checks passed');
					resolve(code);
				} else {
					console.error('❌ TypeScript checks failed');
					reject(new Error(`TypeScript failed with code ${code}`));
				}
			});
		});

		console.log('✅ All lint checks passed');
	} catch (error) {
		console.error('❌ Lint failed:', error.message);
		process.exit(1);
	}
}

void runLint();
