/**
 * Install dependencies for @wpackages/schema
 */

console.log('📦 Installing dependencies...');

try {
	// Install dependencies using Bun
	const installProcess = Bun.spawn(['bun', 'install'], {
		stdout: 'inherit',
		stderr: 'inherit',
	});

	await new Promise((resolve, reject) => {
		installProcess.on('exit', (code) => {
			if (code === 0) {
				console.log('✅ Dependencies installed successfully');
				resolve(code);
			} else {
				console.error('❌ Failed to install dependencies');
				reject(new Error(`Install failed with code ${code}`));
			}
		});
	});
} catch (error) {
	console.error('❌ Error installing dependencies:', error.message);
	process.exit(1);
}
