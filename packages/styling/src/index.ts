import { extractClasses, generateCss } from "./services/generator.service";
export { generateCssBundlesFromContent, generateCssFromContent } from "./services/generator.service";
import type { UserOptions } from "./types/options";

const VIRTUAL_MODULE_ID = "virtual:styling.css";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

export default function stylingPlugin(options: UserOptions = {}): any {
	const shortcuts = options.shortcuts ?? {};
	const foundClasses = new Set<string>();

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
				return await generateCss(foundClasses, options);
			}
		},

		transform(code: string, _id: string) {
			const extracted = extractClasses(code);
			if (extracted.size === 0) {
				return code;
			}

			let changed = false;
			for (const cls of extracted) {
				const expanded = expandShortcut(cls);
				for (const expandedCls of expanded) {
					if (!foundClasses.has(expandedCls)) {
						foundClasses.add(expandedCls);
						changed = true;
					}
				}
			}

			if (changed && server) {
				const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
				if (mod) {
					server.moduleGraph.invalidateModule(mod);
					server.ws.send({
						type: "full-reload",
						path: "*",
					});
				}
			}

			return code;
		},
	};
}
