export const DEFAULT_SERVER_CONFIG = {
	port: 3000,
	hostname: "localhost",
};

export const DEFAULT_BUILD_CONFIG = {
	outDir: "dist",
	assetsDir: "assets",
	minify: false,
	sourcemap: false,
};

export const DEFAULT_VITEXT_CONFIG = {
	root: process.cwd(),
	base: "/",
	server: DEFAULT_SERVER_CONFIG,
	build: DEFAULT_BUILD_CONFIG,
	plugins: [] as unknown[],
	rolldown: {},
};
