#!/usr/bin/env bun

// This script runs a single test file and reports results as JSON to stdout.

import path from 'node:path';
import { getSuites, clearSuites } from '../src/core/registry';
import type { TestSuite } from '../src/core/types';
import type { TestResult } from '../src/reporter/types';

async function runAndReport() {
    const testFile = process.argv[2];
    if (!testFile) {
        console.error(JSON.stringify({ error: 'No test file provided.' }));
        process.exit(1);
    }

    const results: TestResult[] = [];

    try {
        await import(path.resolve(testFile));
        const suites = getSuites();

        async function runSuite(suite: TestSuite) {
            for (const hook of suite.beforeAllHooks) await hook();

            for (const test of suite.tests) {
                try {
                    await test.fn();
                    results.push({ suiteName: suite.name, testName: test.name, status: 'passed' });
                } catch (error) {
                    const testError = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
                    results.push({ suiteName: suite.name, testName: test.name, status: 'failed', error: testError });
                }
            }

            for (const nestedSuite of suite.suites) await runSuite(nestedSuite);
            for (const hook of suite.afterAllHooks) await hook();
        }

        for (const suite of suites) {
            await runSuite(suite);
        }

        console.log(JSON.stringify({ results }));
        clearSuites();

    } catch (error) {
        const importError = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
        console.error(JSON.stringify({ error: 'Failed to run test file.', details: importError }));
        process.exit(1);
    }
}

runAndReport();
