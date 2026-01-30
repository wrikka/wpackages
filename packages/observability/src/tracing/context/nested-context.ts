import type { Context } from "../types/tracing";

export interface ContextLevel {
	context: Context;
	parent?: ContextLevel;
	children: ContextLevel[];
}

export class NestedContextManager {
	private root: ContextLevel | null = null;
	private current: ContextLevel | null = null;

	createRoot(context: Context): void {
		this.root = {
			context,
			children: [],
		};
		this.current = this.root;
	}

	createChild(context: Context): void {
		if (!this.current) {
			this.createRoot(context);
			return;
		}

		const child: ContextLevel = {
			context,
			parent: this.current,
			children: [],
		};

		this.current.children.push(child);
		this.current = child;
	}

	exitToParent(): void {
		if (this.current?.parent) {
			this.current = this.current.parent;
		}
	}

	getCurrent(): Context | null {
		return this.current?.context || null;
	}

	getAncestors(): Context[] {
		const ancestors: Context[] = [];
		let level = this.current;

		while (level?.parent) {
			ancestors.unshift(level.parent.context);
			level = level.parent;
		}

		return ancestors;
	}

	getAllContexts(): Context[] {
		const contexts: Context[] = [];

		const traverse = (level: ContextLevel | null) => {
			if (!level) return;
			contexts.push(level.context);
			for (const child of level.children) {
				traverse(child);
			}
		};

		traverse(this.root);
		return contexts;
	}

	reset(): void {
		this.root = null;
		this.current = null;
	}
}

export function createNestedContextManager(): NestedContextManager {
	return new NestedContextManager();
}
