import type { Plugin } from '../types';
import pc from 'picocolors';

export function summaryPlugin(): Plugin {
    return {
        name: 'summary-plugin',
        setup(ctx) {
            if (!ctx.resolvedConfig.hooks) {
                ctx.resolvedConfig.hooks = {};
            }

            const originalAfterBuild = ctx.resolvedConfig.hooks.afterBuild;

            ctx.resolvedConfig.hooks.afterBuild = async (buildCtx) => {
                // Call original hook if it exists
                if (originalAfterBuild) {
                    await originalAfterBuild(buildCtx);
                }

                console.log(`\n${pc.bold(pc.green('Build Summary:'))}`);
                console.log(`- Output directory: ${pc.cyan(buildCtx.resolvedConfig.outDir)}`);
                // More details like build time and file sizes can be added here later.
            };
        },
    };
}
