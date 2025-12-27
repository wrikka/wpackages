import { describe, expect, it } from "vitest";
import type { PackageInfo } from "../types/index";
import { buildAddArgs, buildInstallArgs, buildRemoveArgs, buildRunArgs, buildUpdateArgs } from "./command-builder.util";

describe("buildInstallArgs", () => {
	it("should build basic install args for bun", () => {
		const args = buildInstallArgs("bun", { cwd: "/test" });
		expect(args).toEqual(["install"]);
	});

	it("should add frozen flag for bun", () => {
		const args = buildInstallArgs("bun", { cwd: "/test", frozen: true });
		expect(args).toContain("--frozen-lockfile");
	});

	it("should add production flag for bun", () => {
		const args = buildInstallArgs("bun", { cwd: "/test", production: true });
		expect(args).toContain("--production");
	});

	it("should add silent flag", () => {
		const args = buildInstallArgs("bun", { cwd: "/test", silent: true });
		expect(args).toContain("--silent");
	});
});

describe("buildAddArgs", () => {
	it("should build add args for single package", () => {
		const packages: readonly PackageInfo[] = [{ name: "react" }];
		const args = buildAddArgs("bun", packages, { cwd: "/test" });
		expect(args).toEqual(["add", "react"]);
	});

	it("should build add args for multiple packages", () => {
		const packages: readonly PackageInfo[] = [{ name: "react" }, { name: "vue" }];
		const args = buildAddArgs("bun", packages, { cwd: "/test" });
		expect(args).toEqual(["add", "react", "vue"]);
	});

	it("should include version in package name", () => {
		const packages: readonly PackageInfo[] = [{ name: "react", version: "18.0.0" }];
		const args = buildAddArgs("bun", packages, { cwd: "/test" });
		expect(args).toContain("react@18.0.0");
	});

	it("should add dev dependency flag for bun", () => {
		const packages: readonly PackageInfo[] = [{ name: "vitest" }];
		const args = buildAddArgs("bun", packages, { cwd: "/test", type: "devDependencies" });
		expect(args).toContain("--dev");
	});

	it("should add exact flag for bun", () => {
		const packages: readonly PackageInfo[] = [{ name: "react" }];
		const args = buildAddArgs("bun", packages, { cwd: "/test", exact: true });
		expect(args).toContain("--exact");
	});

	it("should add global flag for bun", () => {
		const packages: readonly PackageInfo[] = [{ name: "typescript" }];
		const args = buildAddArgs("bun", packages, { cwd: "/test", global: true });
		expect(args).toContain("--global");
	});
});

describe("buildRemoveArgs", () => {
	it("should build remove args for single package", () => {
		const args = buildRemoveArgs("bun", ["react"], { cwd: "/test" });
		expect(args).toEqual(["remove", "react"]);
	});

	it("should build remove args for multiple packages", () => {
		const args = buildRemoveArgs("bun", ["react", "vue"], { cwd: "/test" });
		expect(args).toEqual(["remove", "react", "vue"]);
	});

	it("should add global flag for bun", () => {
		const args = buildRemoveArgs("bun", ["typescript"], { cwd: "/test", global: true });
		expect(args).toContain("--global");
	});
});

describe("buildUpdateArgs", () => {
	it("should build update all args", () => {
		const args = buildUpdateArgs("bun", undefined, { cwd: "/test" });
		expect(args).toEqual(["update"]);
	});

	it("should build update specific packages args", () => {
		const args = buildUpdateArgs("bun", ["react", "vue"], { cwd: "/test" });
		expect(args).toEqual(["update", "react", "vue"]);
	});

	it("should add latest flag for bun", () => {
		const args = buildUpdateArgs("bun", undefined, { cwd: "/test", mode: "latest" });
		expect(args).toContain("--latest");
	});

	it("should add interactive flag for bun", () => {
		const args = buildUpdateArgs("bun", undefined, { cwd: "/test", interactive: true });
		expect(args).toContain("--interactive");
	});
});

describe("buildRunArgs", () => {
	it("should build run args without extra args", () => {
		const args = buildRunArgs("bun", "dev", { cwd: "/test" });
		expect(args).toEqual(["run", "dev"]);
	});

	it("should build run args with extra args", () => {
		const args = buildRunArgs("bun", "dev", { cwd: "/test", args: ["--port=3000"] });
		expect(args).toEqual(["run", "dev", "--port=3000"]);
	});

	it("should add -- for npm", () => {
		const args = buildRunArgs("npm", "dev", { cwd: "/test", args: ["--port=3000"] });
		expect(args).toEqual(["run", "dev", "--", "--port=3000"]);
	});

	it("should add -- for yarn", () => {
		const args = buildRunArgs("yarn", "dev", { cwd: "/test", args: ["--port=3000"] });
		expect(args).toEqual(["run", "dev", "--", "--port=3000"]);
	});
});
