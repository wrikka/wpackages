#!/usr/bin/env bun
import { program } from 'commander';
import { build } from './index';
import { resolveConfig } from './config';
import { createPlan, generateExports } from './services';
import { BuildError } from './error';

function printError(error: unknown) {
    if (error instanceof BuildError) {
        console.error(`bunpack failed [${error.step}:${error.code}]: ${error.message}`);
        if (error.hint) {
            console.error(`hint: ${error.hint}`);
        }
        if (error.cause) {
            console.error(error.cause);
        }
        return;
    }
    console.error('bunpack failed:', error);
}

program
    .command('build')
    .description('Build the project using bunpack')
    .option('-c, --config <path>', 'Specify config file')
    .option('--watch', 'Enable watch mode')
    .option('--dry-run', 'Print build plan and exit')
    .option('--generate-exports', 'Generate package.json exports map based on resolved config')
    .option('--compat', 'Enable tsup-like defaults (cjs+esm+dts+minify+target node)')
    .action(async (options) => {
        try {
            const inlineConfig = {
                configFile: options.config,
                watch: options.watch,
                compat: options.compat,
            };

            if (options.dryRun || options.generateExports) {
                const config = await resolveConfig(inlineConfig);

                if (options.dryRun) {
                    const plan = createPlan(config);
                    console.log(JSON.stringify(plan, null, 2));
                    return;
                }

                if (options.generateExports) {
                    await generateExports(process.cwd(), config);
                    console.log('Generated package.json exports successfully.');
                    return;
                }
            }

            await build(inlineConfig);
        } catch (error) {
            printError(error);
            process.exit(1);
        }
    });

program.parse(process.argv);
