/**
 * Update README for @wpackages/schema
 */

console.log('📝 Updating README...');

async function updateReadme() {
	try {
		// Update README with latest information
		const readmeProcess = Bun.spawn(['bun', 'run', 'update:readme'], {
			stdout: 'inherit',
			stderr: 'inherit',
		});

		await new Promise<void>((resolve, reject) => {
			readmeProcess.on('exit', (code) => {
				if (code === 0) {
					console.log('✅ README updated successfully');
					resolve();
				} else {
					console.error('❌ README update failed');
					reject(new Error(`README update failed with code ${code}`));
				}
			});
		});
	} catch (error) {
		console.error('❌ README update failed:', error.message);
		process.exit(1);
	}
}

void updateReadme();
