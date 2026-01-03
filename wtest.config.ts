import { defineConfig } from "@wpackages/test/config";

export default defineConfig({
	globals: true,
	include: ["**/*.wtest.ts"],
	exclude: ["**/node_modules/**", "**/dist/**"],
});
