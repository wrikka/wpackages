/**
 * Build runner for @wpackages/schema
 */

console.log('🔨 Running build...');

async function runBuild() {
	try {
		// Run build
		const buildProcess = Bun.spawn(['bun', 'run', 'build'], {
			stdout: 'inherit',
			stderr: 'inherit',
		});

		await new Promise<void>((resolve, reject) => {
			buildProcess.on('exit', (code) => {
				if (code === 0) {
					console.log('✅ Build completed successfully');
					resolve();
				} else {
					console.error('❌ Build failed');
					reject(new Error(`Build failed with code ${code}`));
				}
			});
		});
	} catch (error) {
		console.error('❌ Build run failed:', error.message);
		process.exit(1);
	}
}

void runBuild();
