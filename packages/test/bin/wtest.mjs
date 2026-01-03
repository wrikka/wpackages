#!/usr/bin/env bun
import { glob } from 'glob';
import path from 'node:path';
import chokidar from 'chokidar';
import { injectGlobals } from '../src/globals.ts';
import { runTests } from '../src/core/runner.ts';

// Inject our custom global functions
injectGlobals();

// This function encapsulates the test running logic
async function executeTests() {
    const cwd = process.cwd();
    const testFiles = await glob('src/**/*.test.ts', { cwd, absolute: true });

    // Import each test file to register the tests.
    // We use a timestamp query to bust the module cache in watch mode.
    for (const file of testFiles) {
        await import(`${path.resolve(file)}?t=${Date.now()}`);
    }

    await runTests();
}

async function main() {
    const isWatchMode = process.argv.includes('--watch');

    if (isWatchMode) {
        console.log('Starting in watch mode...');
        const watcher = chokidar.watch('src/**/*.ts', {
            persistent: true,
            ignoreInitial: true,
        });

        const triggerRun = async (filePath) => {
            console.clear();
            console.log(`\nFile changed: ${path.relative(process.cwd(), filePath)}`);
            console.log('Re-running tests...');
            try {
                await executeTests();
            } catch (err) {
                console.error('An error occurred during the test run:', err);
            }
            console.log('\nWatching for file changes...');
        };

        watcher.on('change', triggerRun).on('add', triggerRun).on('unlink', triggerRun);

        // Initial run
        await executeTests();
        console.log('\nWatching for file changes...');
    } else {
        await executeTests();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
