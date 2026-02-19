/**
 * Verify all scripts for @wpackages/schema
 */

console.log('🔍 Running verification...');

async function runVerify() {
	try {
		console.log('📋 Running all verification scripts...\n');

		// Run all scripts in sequence
		const scripts = [
			'install',
			'lint', 
			'test',
			'coverage',
			'build',
			'update-readme'
		];

		for (const script of scripts) {
			console.log(`🔄 Running ${script}...`);
			
			const scriptProcess = Bun.spawn(['bun', 'run', script], {
				stdout: 'inherit',
				stderr: 'inherit',
			});

			await new Promise<void>((resolve, reject) => {
				scriptProcess.on('exit', (code) => {
					if (code === 0) {
						console.log(`✅ ${script} completed successfully`);
					} else {
						console.error(`❌ ${script} failed with code ${code}`);
						reject(new Error(`${script} failed`));
					}
				});
			});
		}

		console.log('\n🎯 All verification scripts completed!');
		console.log('📊 @wpackages/schema is ready for production!');

	} catch (error) {
		console.error('❌ Verification failed:', error.message);
		process.exit(1);
	}
}

void runVerify();
