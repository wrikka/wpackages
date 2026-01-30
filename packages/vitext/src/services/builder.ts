import { err, ok } from "@wpackages/functional";
import type { BuildConfig } from "../types/config";
import { logError, logInfo } from "../utils/logger";
import { resolvePath } from "../utils/path";
import { cacheService } from "./caching";
import { buildError } from "./error-handler";
import type { BuildResult } from "./error-handler";

export const buildProject = async (config: BuildConfig): Promise<BuildResult<void>> => {
	logInfo("Starting build process...");

	try {
		// Check if we have a cached build
		const cacheKey = `build:${config.outDir}:${Date.now()}`;
		const cachedResult = cacheService.getBuildArtifact(cacheKey);

		if (cachedResult) {
			logInfo("Using cached build result");
			return ok(undefined);
		}

		logInfo(`Building to output directory: ${resolvePath(process.cwd(), config.outDir)}`);

		// Use bundler configuration
		// bundler is removed

		// Cache the build result
		cacheService.setBuildArtifact(cacheKey, {
			timestamp: Date.now(),
			outDir: config.outDir,
		});

		logInfo("Build completed successfully!");
		return ok(undefined);
	} catch (error) {
		logError(`Build failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		return err(buildError("Build failed", error));
	}
};

export const createBuildConfig = (config?: Partial<BuildConfig>): BuildConfig => {
	return {
		outDir: config?.outDir ?? "dist",
		assetsDir: config?.assetsDir ?? "assets",
		minify: config?.minify ?? false,
		sourcemap: config?.sourcemap ?? false,
		manifest: config?.manifest ?? false,
		ssrManifest: config?.ssrManifest ?? false,
		ssr: config?.ssr ?? false,
		emptyOutDir: config?.emptyOutDir ?? false,
	};
};
