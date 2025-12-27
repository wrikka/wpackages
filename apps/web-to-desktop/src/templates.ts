/**
 * Tauri Project Templates
 */

import type { AppConfig } from "./types";

/**
 * Generate tauri.conf.json
 */
export function generateTauriConfig(config: AppConfig): string {
	return JSON.stringify(
		{
			"productName": config.name,
			"version": config.version || "1.0.0",
			"identifier": config.identifier || `com.${config.name.toLowerCase()}.app`,
			"build": {
				"beforeDevCommand": "",
				"beforeBuildCommand": "",
				"devUrl": config.url,
				"frontendDist": "../dist",
			},
			"app": {
				"windows": [
					{
						"title": config.name,
						"width": config.width || 1200,
						"height": config.height || 800,
						"resizable": config.resizable !== false,
						"fullscreen": config.fullscreen || false,
						"transparent": config.transparent || false,
						"decorations": !config.hideMenuBar,
					},
				],
				"security": {
					"csp": null,
				},
			},
			"bundle": {
				"active": true,
				"targets": "all",
				"icon": config.icon ? [config.icon] : [],
				"resources": [],
				"externalBin": [],
				"copyright": "",
				"category": "DeveloperTool",
				"shortDescription": `${config.name} Desktop App`,
				"longDescription": `${config.name} - Web to Desktop Application`,
				"linux": {
					"deb": {
						"depends": [],
					},
				},
				"macOS": {
					"frameworks": [],
					"minimumSystemVersion": "10.13",
				},
				"windows": {
					"certificateThumbprint": null,
					"digestAlgorithm": "sha256",
					"timestampUrl": "",
				},
			},
		},
		null,
		2,
	);
}

/**
 * Generate main.rs
 */
export function generateMainRs(config: AppConfig): string {
	const injectCss = config.injectCss
		? `
    window.eval(&format!(
      "const style = document.createElement('style');
       style.textContent = \`{}\`;
       document.head.appendChild(style);",
      r#"${config.injectCss}"#
    )).ok();
  `
		: "";

	const injectJs = config.injectJs
		? `
    window.eval(&format!("{}",r#"${config.injectJs}"#)).ok();
  `
		: "";

	return `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            ${injectCss}
            ${injectJs}
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`;
}

/**
 * Generate Cargo.toml
 */
export function generateCargoToml(config: AppConfig): string {
	return `[package]
name = "${config.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}"
version = "${config.version || "1.0.0"}"
description = "${config.name} Desktop App"
authors = ["you"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = ["devtools"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
`;
}

/**
 * Generate build.rs
 */
export function generateBuildRs(): string {
	return `fn main() {
    tauri_build::build()
}
`;
}

/**
 * Generate package.json
 */
export function generatePackageJson(config: AppConfig): string {
	return JSON.stringify(
		{
			"name": config.name.toLowerCase(),
			"version": config.version || "1.0.0",
			"description": `${config.name} Desktop App`,
			"scripts": {
				"dev": "tauri dev",
				"build": "tauri build",
				"build:debug": "tauri build --debug",
			},
			"devDependencies": {
				"@tauri-apps/cli": "^2.0.0",
			},
		},
		null,
		2,
	);
}

/**
 * Generate index.html
 */
export function generateIndexHtml(config: AppConfig): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        iframe {
            border: none;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <iframe src="${config.url}" allow="camera; microphone; geolocation;"></iframe>
</body>
</html>
`;
}

/**
 * Generate README
 */
export function generateReadme(config: AppConfig): string {
	return `# ${config.name}

Desktop application for ${config.url}

## Development

\`\`\`bash
bun install
bun run dev
\`\`\`

## Build

\`\`\`bash
bun run build
\`\`\`

## Configuration

- **URL**: ${config.url}
- **Window**: ${config.width}x${config.height}
- **Version**: ${config.version}

---

Generated with web-to-app CLI
`;
}
