import { defineConfig } from './src';
import { summaryPlugin } from './src/plugins/summary-plugin';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: '.output',
    name: '@wpackages/ts-build',
    clean: true,
    format: ['esm', 'cjs'],
    external: ['bun-plugin-vue', 'bun-plugin-svelte'],
    sourcemap: false,
    dts: true,
    bin: {
        bunpack: 'src/cli.ts',
    },
    plugins: [
        summaryPlugin(),
    ],
});
