import fs from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import pc from "picocolors";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const wdevtoolsPath = dirname(require.resolve("wdevtools/package.json"));
const clientPath = resolve(wdevtoolsPath, "./client/index.ts");

const VIRTUAL_MODULE_ID = "virtual:wdevtools-client";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

export function createDevtoolsPlugin(): Plugin {
	return {
		apply: "serve",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url === "/_wdevtools") {
					res.writeHead(200, { "Content-Type": "text/html" });
					res.end(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>WDevtools</title>
                </head>
                <body>
                  <div id="wdevtools-container"></div>
                  <script type="module" src="/@id/${VIRTUAL_MODULE_ID}"></script>
                </body>
                </html>
              `);
					return;
				}
				next();
			});

			server.ws.on("connection", (ws) => {
				ws.on("message", (data) => {
					const message = JSON.parse(data.toString());
					if (message.type === "wdevtools:client-ready") {
						server.ws.send("wdevtools:vite-config", { config: server.config });
						const packageJsonPath = resolve(server.config.root, "package.json");
						try {
							const packageJson = JSON.parse(
								fs.readFileSync(packageJsonPath, "utf-8"),
							);
							server.ws.send("wdevtools:package-info", { packageJson });
						} catch (e) {
							console.error(
								"wdevtools: could not find or parse package.json",
								e,
							);
						}
					}
				});
			});

			const _printUrls = server.printUrls;
			server.printUrls = () => {
				_printUrls();
				const url = `${server.config.server.https ? "https" : "http"}://localhost:${server.config.server.port || "80"}/_wdevtools`;
				console.log(
					`  ${pc.green("➜")}  ${pc.bold("WDevtools")}: ${pc.cyan(url)}`,
				);
			};
		},
		load(id) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				return `import "/@fs/${clientPath.replace(/\\/g, "/")}"`;
			}
		},
		name: "vite-plugin-wdev-devtools",
		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
		},
	};
}
