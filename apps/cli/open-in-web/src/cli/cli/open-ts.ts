import { serve } from "bun";
import open from "open";
import { createTsHtmlContent } from "../utils/ts-generators";
import type { OpenTsOptions } from "../utils/types/open-ts";
import { validateTsFile } from "../utils/validators";

export async function openTs(filePath: string, options: OpenTsOptions) {
	const validatedPath = validateTsFile(filePath);

	try {
		const code = await Bun.file(validatedPath).text();
		const markdownContent = await createTsHtmlContent(validatedPath, code);

		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>TypeScript Preview</title>
          <style>
            body { 
              max-width: 1200px; 
              margin: 0 auto; 
              padding: 40px 20px; 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              line-height: 1.6;
              background: #0d1117;
              color: #c9d1d9;
            }
            h1 { 
              color: #58a6ff; 
              border-bottom: 2px solid #21262d;
              padding-bottom: 10px;
            }
            h2 { 
              color: #58a6ff; 
              margin-top: 2rem;
            }
            .schema-section {
              background: #161b22;
              border: 1px solid #30363d;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
            }
            .schema-item {
              margin: 15px 0;
            }
            pre { 
              background: #161b22; 
              padding: 16px; 
              border-radius: 6px; 
              overflow: auto;
              border: 1px solid #30363d;
            }
            code { 
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          ${markdownContent}
        </body>
      </html>
    `;

		const server = serve({
			port: 3000,
			hostname: "localhost",
			fetch() {
				return new Response(htmlContent, {
					headers: { "Content-Type": "text/html" },
				});
			},
		});

		console.log(`\n🚀 TypeScript preview server running at http://localhost:3000`);
		console.log(`📂 File: ${validatedPath.split(/[\\/]/).pop()}\n`);

		if (options.autoOpen) {
			await open(`http://localhost:3000`);
		}

		return server;
	} catch (err) {
		console.error(`Error opening file: ${err instanceof Error ? err.message : "Unknown error"}`);
		process.exit(1);
	}
}
