import { Effect } from "effect";
import { ContentFormat, StructuredContent, SearchResult } from "../types";
import { parseHTML, extractMainContent, removeScriptsAndStyles, extractLinks as extractLinksFromHTML } from "../lib";

export class ContentFormatterService {
  formatContent(result: SearchResult, formats: ContentFormat[]): Effect.Effect<StructuredContent, Error> {
    return Effect.gen(function* () {
      const content: StructuredContent = {
        title: result.title,
        url: result.url,
        content: result.snippet,
        wordCount: result.snippet.split(/\s+/).length,
        extractionTime: 0,
      };

      if (formats.includes("markdown") || formats.includes("links") || formats.includes("structured")) {
        const extracted = yield* extractFullContent(result.url);
        content.content = extracted.content;
        content.wordCount = extracted.wordCount;
        content.extractionTime = extracted.extractionTime;
      }

      if (formats.includes("markdown")) {
        content.markdown = convertToMarkdown(content.content);
      }

      if (formats.includes("links")) {
        const $ = yield* parseHTML(content.content);
        content.links = extractLinksFromHTML($, "a");
      }

      return content;
    });
  }

  formatBatch(results: SearchResult[], formats: ContentFormat[]): Effect.Effect<StructuredContent[], Error> {
    return Effect.all(results.map((result) => this.formatContent(result, formats)), {
      concurrency: 3,
    });
  }
}

function extractFullContent(url: string): Effect.Effect<{ content: string; wordCount: number; extractionTime: number }, Error> {
  return Effect.gen(function* () {
    const startTime = Date.now();

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(30000),
        }),
      catch: (error) => new Error(`Failed to fetch ${url}: ${error}`),
    });

    if (!response.ok) {
      return yield* Effect.fail(new Error(`HTTP ${response.status} for ${url}`));
    }

    const html = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (error) => new Error(`Failed to read response from ${url}: ${error}`),
    });

    const $ = yield* parseHTML(html);
    const cleaned = removeScriptsAndStyles($);
    const content = extractMainContent(cleaned);

    const extractionTime = Date.now() - startTime;

    return {
      content,
      wordCount: content.split(/\s+/).length,
      extractionTime,
    };
  });
}

function convertToMarkdown(content: string): string {
  return content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((p) => p.length > 0)
    .join("\n\n");
}
