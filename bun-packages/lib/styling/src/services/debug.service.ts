export interface DebugOptions {
	readonly showClassNames?: boolean;
	readonly showCssSource?: boolean;
	readonly highlightElements?: boolean;
	readonly showUnusedClasses?: boolean;
}

let debugOverlay: HTMLDivElement | null = null;
let debugEnabled = false;

export function enableDebug(options: DebugOptions = {}): void {
	debugEnabled = true;

	if (!debugOverlay) {
		debugOverlay = document.createElement("div");
		debugOverlay.id = "styling-debug-overlay";
		debugOverlay.style.cssText = `
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: 300px;
			background: rgba(0, 0, 0, 0.9);
			color: white;
			font-family: monospace;
			font-size: 12px;
			padding: 16px;
			overflow-y: auto;
			z-index: 999999;
			pointer-events: none;
		`;
		document.body.appendChild(debugOverlay);
	}

	if (options.highlightElements) {
		enableElementHighlighting();
	}

	if (options.showClassNames) {
		enableClassNameDisplay();
	}

	if (options.showCssSource) {
		enableCssSourceDisplay();
	}
}

export function disableDebug(): void {
	debugEnabled = false;

	if (debugOverlay) {
		debugOverlay.remove();
		debugOverlay = null;
	}

	disableElementHighlighting();
	disableClassNameDisplay();
	disableCssSourceDisplay();
}

export function toggleDebug(options: DebugOptions = {}): void {
	if (debugEnabled) {
		disableDebug();
	} else {
		enableDebug(options);
	}
}

function enableElementHighlighting(): void {
	const style = document.createElement("style");
	style.id = "styling-debug-highlight";
	style.textContent = `
		[data-styling-debug] {
			outline: 2px solid #f59e0b !important;
			outline-offset: -2px;
			position: relative;
		}
		[data-styling-debug]:hover {
			outline-color: #3b82f6 !important;
		}
		[data-styling-debug]::after {
			content: attr(data-styling-debug);
			position: absolute;
			top: -20px;
			left: 0;
			background: #f59e0b;
			color: white;
			padding: 2px 6px;
			font-size: 10px;
			border-radius: 2px;
			white-space: nowrap;
			pointer-events: none;
			z-index: 1;
		}
	`;
	document.head.appendChild(style);

	document.querySelectorAll("*").forEach(el => {
		const classes = el.className;
		if (classes) {
			el.setAttribute("data-styling-debug", classes);
		}
	});
}

function disableElementHighlighting(): void {
	const style = document.getElementById("styling-debug-highlight");
	if (style) {
		style.remove();
	}

	document.querySelectorAll("[data-styling-debug]").forEach(el => {
		el.removeAttribute("data-styling-debug");
	});
}

function enableClassNameDisplay(): void {
	const observer = new MutationObserver(() => {
		if (!debugOverlay) return;

		const allClasses = new Set<string>();
		document.querySelectorAll("*").forEach(el => {
			const classes = el.className;
			if (classes) {
				classes.split(/\s+/).forEach(cls => {
					if (cls) allClasses.add(cls);
				});
			}
		});

		debugOverlay.innerHTML = `
			<h3>Classes (${allClasses.size})</h3>
			<ul style="list-style: none; padding: 0;">
				${Array.from(allClasses)
					.slice(0, 100)
					.map(cls => `<li style="padding: 2px 0;">${cls}</li>`)
					.join("")}
				${allClasses.size > 100 ? `<li style="padding: 2px 0; color: #f59e0b;">... and ${allClasses.size - 100} more</li>` : ""}
			</ul>
		`;
	});

	observer.observe(document.body, {
		subtree: true,
		attributes: true,
		attributeFilter: ["class"],
	});
}

function disableClassNameDisplay(): void {
}

function enableCssSourceDisplay(): void {
	const style = document.createElement("style");
	style.id = "styling-debug-css-source";
	style.textContent = `
		[data-styling-css-source] {
			position: relative;
		}
		[data-styling-css-source]:hover::before {
			content: "CSS: " attr(data-styling-css-source);
			position: fixed;
			bottom: 10px;
			left: 10px;
			background: rgba(0, 0, 0, 0.9);
			color: white;
			padding: 8px 12px;
			border-radius: 4px;
			font-family: monospace;
			font-size: 11px;
			max-width: 400px;
			overflow: auto;
			white-space: pre-wrap;
			z-index: 999998;
			pointer-events: none;
		}
	`;
	document.head.appendChild(style);
}

function disableCssSourceDisplay(): void {
	const style = document.getElementById("styling-debug-css-source");
	if (style) {
		style.remove();
	}

	document.querySelectorAll("[data-styling-css-source]").forEach(el => {
		el.removeAttribute("data-styling-css-source");
	});
}

export function showClassUsage(className: string): void {
	const elements = document.querySelectorAll(`.${className}`);
	console.log(`[styling] Class "${className}" used in ${elements.length} element(s):`, elements);

	if (debugOverlay) {
		debugOverlay.innerHTML += `
			<div style="margin-top: 16px; padding: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
				<strong>Class: ${className}</strong><br>
				Used in: ${elements.length} element(s)
			</div>
		`;
	}
}
