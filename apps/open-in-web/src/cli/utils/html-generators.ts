import { createHtmlServerConfig } from "../../components";

export function createServerConfig(filePath: string) {
	return createHtmlServerConfig(filePath);
}

export function createHtmlContent(renderedContent: string) {
	return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Markdown Preview</title>
        <style>
          body { max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; }
          code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; }
          pre { background: #f6f8fa; padding: 16px; border-radius: 3px; overflow: auto; }
          blockquote { border-left: 4px solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0 0 1em 0; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        ${renderedContent}
      </body>
    </html>
  `;
}
