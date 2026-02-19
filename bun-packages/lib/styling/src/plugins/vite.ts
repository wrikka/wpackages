import { generateCss, extractClasses } from "../services/generator.service";
import { extractAttributes } from "../services/attribute-extractor.service";
import type { UserOptions } from "../types/options";

const VIRTUAL_MODULE_ID = "virtual:styling.css";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

export interface VitePluginOptions extends UserOptions {}

export default function stylingPlugin(options: VitePluginOptions = {}): any {
	const shortcuts = options.shortcuts ?? {};
	const foundClasses = new Set<string>();
	const modes = options.mode ?? ["class"];
	const useAttributify = modes.includes("attributify");

	let hmrTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingClasses = new Set<string>();

	function expandShortcut(cls: string, seen = new Set<string>()): string[] {
		if (seen.has(cls)) {
			console.warn(`[styling] Circular shortcut detected: ${cls}`);
			return [];
		}
		seen.add(cls);

		if (shortcuts[cls]) {
			return shortcuts[cls].split(/\s+/).flatMap(part => expandShortcut(part, seen));
		}
		return [cls];
	}
	let server: any;
	let cssContent = "";

	return {
		name: "@wpackages/styling",

		configureServer(_server: any) {
			server = _server;
		},

		resolveId(id: string) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
		},

		async load(id: string) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				cssContent = await generateCss(foundClasses, options);
				return cssContent;
			}
		},

		transform(code: string, _id: string) {
			const extracted = extractClasses(code);
			if (useAttributify) {
				const attributes = extractAttributes(code);
				for (const attr of attributes) {
					extracted.add(attr);
				}
			}
			if (extracted.size === 0) {
				return code;
			}

			for (const cls of extracted) {
				pendingClasses.add(cls);
			}

			if (hmrTimer) {
				clearTimeout(hmrTimer);
			}

			hmrTimer = setTimeout(async () => {
				if (!server) return;

				let changed = false;
				for (const cls of pendingClasses) {
					const expanded = expandShortcut(cls);
					for (const expandedCls of expanded) {
						if (!foundClasses.has(expandedCls)) {
							foundClasses.add(expandedCls);
							changed = true;
						}
					}
				}
				pendingClasses.clear();

				if (!changed) return;

				const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
				if (mod) {
					const newCss = await generateCss(foundClasses, options);
					
					if (newCss !== cssContent) {
						cssContent = newCss;
						server.moduleGraph.invalidateModule(mod);
						
						server.ws.send({
							type: "update",
							updates: [
								{
									type: "css-update",
									timestamp: Date.now(),
									path: VIRTUAL_MODULE_ID,
									acceptedPath: VIRTUAL_MODULE_ID,
								},
							],
						});
					}
				}
			}, 50);

			return code;
		},
	};
}

export { VIRTUAL_MODULE_ID, RESOLVED_VIRTUAL_MODULE_ID };
