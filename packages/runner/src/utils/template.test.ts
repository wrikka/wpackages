import { describe, expect, it } from "vitest";
import { bash, cmd, createTemplate, ps, sh } from "./template";

describe("template utils", () => {
	describe("cmd", () => {
		it("should parse simple command template", () => {
			const result = cmd`echo hello`;
			expect(result.command).toBe("echo");
			expect(result.args).toEqual(["hello"]);
		});

		it("should interpolate values", () => {
			const name = "world";
			const result = cmd`echo hello ${name}`;
			expect(result.command).toBe("echo");
			expect(result.args).toEqual(["hello", "world"]);
		});

		it("should handle multiple interpolations", () => {
			const arg1 = "hello";
			const arg2 = "world";
			const result = cmd`echo ${arg1} ${arg2}`;
			expect(result.command).toBe("echo");
			expect(result.args).toEqual([arg1, arg2]);
		});

		it("should handle numbers", () => {
			const port = 3000;
			const result = cmd`curl localhost:${port}`;
			expect(result.command).toBe("curl");
			expect(result.args).toEqual(["localhost:3000"]);
		});
	});

	describe("sh", () => {
		it("should create shell command", () => {
			const result = sh`echo hello`;
			expect(result.command).toBe("echo");
			expect(result.shell).toBe(true);
		});

		it("should interpolate in shell command", () => {
			const file = "test.txt";
			const result = sh`cat ${file}`;
			expect(result.command).toBe("cat");
			expect(result.args).toEqual([file]);
			expect(result.shell).toBe(true);
		});
	});

	describe("ps", () => {
		it("should create PowerShell command", () => {
			const result = ps`Get-Process`;
			expect(result.command).toBe("powershell");
			expect(result.args).toEqual(["-Command", "Get-Process"]);
		});

		it("should interpolate in PowerShell command", () => {
			const name = "node";
			const result = ps`Get-Process ${name}`;
			expect(result.command).toBe("powershell");
			expect(result.args).toEqual(["-Command", `Get-Process ${name}`]);
		});
	});

	describe("bash", () => {
		it("should create Bash command", () => {
			const result = bash`echo hello`;
			expect(result.command).toBe("bash");
			expect(result.args).toEqual(["-c", "echo hello"]);
		});

		it("should interpolate in Bash command", () => {
			const var1 = "test";
			const result = bash`echo ${var1}`;
			expect(result.command).toBe("bash");
			expect(result.args).toEqual(["-c", `echo ${var1}`]);
		});
	});

	describe("createTemplate", () => {
		it("should create reusable template", () => {
			const tpl = createTemplate("git commit -m '{message}'");
			const result = tpl({ message: "Initial commit" });
			expect(result.command).toBe("git");
			expect(result.args).toEqual(["commit", "-m", "Initial commit"]);
		});

		it("should handle multiple variables", () => {
			const tpl = createTemplate("docker run -p {port}:{port} '{image}'");
			const result = tpl({ port: "3000", image: "nginx" });
			expect(result.command).toBe("docker");
			expect(result.args).toEqual(["run", "-p", "3000:3000", "nginx"]);
		});

		it("should replace all occurrences", () => {
			const tpl = createTemplate("echo {val} {val}");
			const result = tpl({ val: "test" });
			expect(result.args).toEqual(["test", "test"]);
		});
	});
});
