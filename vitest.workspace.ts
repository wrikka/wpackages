import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	// Packages
	'packages/*/vitest.config.ts',
	// Apps
	'apps/*/vitest.config.ts',
	'apps/cli/*/vitest.config.ts',
	// Plugins
	'plugins/*/vitest.config.ts',
	'plugins/nuxt-modules/*/vitest.config.ts',
	'plugins/vite-plugins/*/vitest.config.ts',
	// WTest (custom test config)
	'wtest.config.ts',
]);
