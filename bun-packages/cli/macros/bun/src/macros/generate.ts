/**
 * Code generation macro for creating boilerplate code from templates.
 *
 * @param template - Template name or template function
 * @param data - Data to fill into template
 * @returns Generated code string
 * @throws Error if template is invalid
 *
 * @example
 * // const code = generate("api-route", { path: "/users", methods: ["GET", "POST"] })
 */
export const generate = Bun.macro((
	template: string | ((data: Record<string, unknown>) => string),
	data: Record<string, unknown> = {},
) => {
	try {
		let code = "";

		if (typeof template === "function") {
			code = template(data);
		} else {
			code = getTemplate(template, data);
		}

		return JSON.stringify(code);
	} catch (error) {
		throw new Error(
			"Failed to generate code: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Get template by name.
 */
function getTemplate(name: string, data: Record<string, unknown>): string {
	const templates: Record<string, (data: Record<string, unknown>) => string> = {
		"api-route": (d) => {
			const path = String(d["path"] || "/api");
			const methods = Array.isArray(d["methods"]) ? d["methods"] : ["GET"];
			return `
import { serve } from "bun";

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "${path}") {
      const method = req.method;
      
      ${
				methods.map((m) => `
      if (method === "${m}") {
        // Handle ${m} request
        return new Response(JSON.stringify({ message: "${m} ${path}" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      `).join("\n")
			}
      
      return new Response("Method not allowed", { status: 405 });
    }
    
    return new Response("Not found", { status: 404 });
  }
});
`.trim();
		},
		"cli-command": (d) => {
			const commandName = String(d["commandName"] || "command");
			return `
#!/usr/bin/env bun
import { $ } from "bun";

async function ${commandName}() {
  console.log("Running ${commandName}...");
  // Add your command logic here
}

${commandName}();
`.trim();
		},
		"react-component": (d) => {
			const componentName = String(d["componentName"] || "Component");
			return `
import React from "react";

interface ${componentName}Props {
  // Add your props here
}

export function ${componentName}(props: ${componentName}Props) {
  return (
    <div>
      {/* Add your component JSX here */}
    </div>
  );
}
`.trim();
		},
	};

	const templateFn = templates[name];
	if (!templateFn) {
		throw new Error(`Template "${name}" not found`);
	}

	return templateFn(data);
}
