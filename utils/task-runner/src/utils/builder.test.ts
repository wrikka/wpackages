import { describe, expect, it } from "vitest";
import { bun, command, CommandBuilder, docker, git, npm } from "./builder";

describe("builder utils", () => {
	describe("CommandBuilder", () => {
		it("should build basic command", () => {
			const builder = new CommandBuilder("echo", ["hello"]);
			const options = builder.build();

			expect(options.command).toBe("echo");
			expect(options.args).toEqual(["hello"]);
		});

		it("should add args", () => {
			const builder = new CommandBuilder("echo").args("hello", "world");
			const options = builder.build();

			expect(options.args).toEqual(["hello", "world"]);
		});

		it("should set cwd", () => {
			const builder = new CommandBuilder("ls").cwd("/tmp");
			const options = builder.build();

			expect(options.cwd).toBe("/tmp");
		});

		it("should set env", () => {
			const builder = new CommandBuilder("echo").env({
				NODE_ENV: "production",
			});
			const options = builder.build();

			expect(options.env).toEqual({ NODE_ENV: "production" });
		});

		it("should add single env", () => {
			const builder = new CommandBuilder("echo")
				.addEnv("VAR1", "value1")
				.addEnv("VAR2", "value2");
			const options = builder.build();

			expect(options.env).toEqual({
				VAR1: "value1",
				VAR2: "value2",
			});
		});

		it("should set timeout", () => {
			const builder = new CommandBuilder("echo").timeout(5000);
			const options = builder.build();

			expect(options.timeout).toBe(5000);
		});

		it("should use shell", () => {
			const builder = new CommandBuilder("echo hello").shell();
			const options = builder.build();

			expect(options.shell).toBe(true);
		});

		it("should chain methods", () => {
			const builder = new CommandBuilder("npm")
				.args("install")
				.cwd("/project")
				.env({ NODE_ENV: "production" })
				.timeout(30000)
				.verbose()
				.preferLocal();

			const options = builder.build();

			expect(options.command).toBe("npm");
			expect(options.args).toEqual(["install"]);
			expect(options.cwd).toBe("/project");
			expect(options.env).toEqual({ NODE_ENV: "production" });
			expect(options.timeout).toBe(30000);
			expect(options.verbose).toBe(true);
			expect(options.preferLocal).toBe(true);
		});

		it("should clone builder", () => {
			const original = new CommandBuilder("git").args("status").cwd("/repo");
			const cloned = original.clone();

			cloned.args("--short");

			expect(original.build().args).toEqual(["status"]);
			expect(cloned.build().args).toEqual(["status", "--short"]);
		});

		it("should throw error if command is missing", () => {
			const builder = new CommandBuilder("");
			expect(() => builder.build()).toThrow("Command is required");
		});
	});

	describe("command", () => {
		it("should create command builder", () => {
			const builder = command("echo", "hello");
			expect(builder).toBeInstanceOf(CommandBuilder);
			expect(builder.build().command).toBe("echo");
			expect(builder.build().args).toEqual(["hello"]);
		});
	});

	describe("git", () => {
		it("should create git command", () => {
			const builder = git("status");
			expect(builder.build().command).toBe("git");
			expect(builder.build().args).toEqual(["status"]);
		});

		it("should chain git methods", () => {
			const builder = git("commit").args("-m", "Initial commit");
			expect(builder.build().args).toEqual(["commit", "-m", "Initial commit"]);
		});
	});

	describe("npm", () => {
		it("should create npm command", () => {
			const builder = npm("install");
			expect(builder.build().command).toBe("npm");
			expect(builder.build().args).toEqual(["install"]);
		});
	});

	describe("docker", () => {
		it("should create docker command", () => {
			const builder = docker("ps");
			expect(builder.build().command).toBe("docker");
			expect(builder.build().args).toEqual(["ps"]);
		});
	});

	describe("bun", () => {
		it("should create bun command", () => {
			const builder = bun("install");
			expect(builder.build().command).toBe("bun");
			expect(builder.build().args).toEqual(["install"]);
		});
	});
});
