import path from "node:path";
import * as vm from "node:vm";

interface SandboxContext {
	modules: Map<string, any>;
	globals: Record<string, any>;
}

class TestSandbox {
	private context: SandboxContext;
	private vmContext: vm.Context;
	private originalRequire: NodeRequire;

	constructor() {
		this.context = {
			modules: new Map(),
			globals: {},
		};

		// Create isolated VM context
		this.vmContext = vm.createContext({
			...this.context.globals,
			require: this.createSandboxedRequire(),
			console: {
				log: console.log.bind(console),
				error: console.error.bind(console),
				warn: console.warn.bind(console),
				info: console.info.bind(console),
			},
			Buffer,
			process: {
				...process,
				env: { ...process.env },
			},
		});

		// Store original require for fallback
		this.originalRequire = require;
	}

	private createSandboxedRequire(): NodeRequire {
		const sandboxedRequire = ((id: string) => {
			// Check if module is already cached in sandbox
			if (this.context.modules.has(id)) {
				return this.context.modules.get(id);
			}

			try {
				// Try to resolve and load module normally first
				const resolved = require.resolve(id);

				// For built-in modules, use original require
				if (resolved.startsWith("node:") || !resolved.includes("/node_modules/")) {
					return this.originalRequire(id);
				}

				// For user modules, load in sandbox
				const moduleExports = this.loadModuleInSandbox(resolved);
				this.context.modules.set(id, moduleExports);
				return moduleExports;
			} catch (error: any) {
				console.warn("Failed to load module in sandbox, falling back to original require:", error);
				// Fallback to original require if sandbox loading fails
				return this.originalRequire(id);
			}
		}) as NodeRequire;

		// Copy require properties
		Object.setPrototypeOf(sandboxedRequire, Object.getPrototypeOf(this.originalRequire));
		(sandboxedRequire as any).resolve = this.originalRequire.resolve.bind(this.originalRequire);
		(sandboxedRequire as any).cache = this.originalRequire.cache;

		return sandboxedRequire;
	}

	private loadModuleInSandbox(modulePath: string): any {
		const code = require("fs").readFileSync(modulePath, "utf8");

		// Wrap module code in CommonJS wrapper
		const wrappedCode = `
			(function(module, exports, require, __dirname, __filename) {
				${code}
			})
		`;

		const moduleObj = { exports: {} };
		const dirname = path.dirname(modulePath);
		const filename = modulePath;

		// Execute in sandbox context
		const wrapper = vm.runInContext(wrappedCode, this.vmContext, {
			filename: modulePath,
			displayErrors: true,
		});

		// Call the wrapper with sandboxed require
		wrapper(moduleObj, moduleObj.exports, this.createSandboxedRequire(), dirname, filename);

		return moduleObj.exports;
	}

	async executeTestCode(code: string, filename: string): Promise<any> {
		try {
			// Clear module cache for this test file
			const moduleId = path.resolve(filename);
			this.context.modules.delete(moduleId);

			// Execute test code in sandbox
			const result = await vm.runInContext(code, this.vmContext, {
				filename,
				displayErrors: true,
				timeout: 30000, // 30 second timeout
			});

			return result;
		} catch (error) {
			// Enhance error with sandbox context
			if (error instanceof Error) {
				error.message = `[Sandbox] ${error.message}`;
			}
			throw error;
		}
	}

	reset(): void {
		// Clear module cache
		this.context.modules.clear();

		// Reset globals to initial state
		this.context.globals = {};

		// Recreate VM context
		this.vmContext = vm.createContext({
			...this.context.globals,
			require: this.createSandboxedRequire(),
			console: {
				log: console.log.bind(console),
				error: console.error.bind(console),
				warn: console.warn.bind(console),
				info: console.info.bind(console),
			},
			Buffer,
			process: {
				...process,
				env: { ...process.env },
			},
		});
	}

	addGlobal(name: string, value: any): void {
		this.context.globals[name] = value;
		(this.vmContext as any)[name] = value;
	}

	removeGlobal(name: string): void {
		delete this.context.globals[name];
		delete (this.vmContext as any)[name];
	}

	getModuleCache(): Map<string, any> {
		return this.context.modules;
	}

	// Cleanup method to prevent memory leaks
	destroy(): void {
		this.context.modules.clear();
		this.context.globals = {};
		// VM context will be garbage collected
	}
}

// Sandbox pool for reuse
class SandboxPool {
	private pool: TestSandbox[] = [];
	private maxSize = 4;

	acquire(): TestSandbox {
		if (this.pool.length > 0) {
			const sandbox = this.pool.pop()!;
			sandbox.reset();
			return sandbox;
		}
		return new TestSandbox();
	}

	release(sandbox: TestSandbox): void {
		if (this.pool.length < this.maxSize) {
			sandbox.reset();
			this.pool.push(sandbox);
		} else {
			sandbox.destroy();
		}
	}

	destroy(): void {
		for (const sandbox of this.pool) {
			sandbox.destroy();
		}
		this.pool = [];
	}
}

export const sandboxPool = new SandboxPool();
export { SandboxPool, TestSandbox };
