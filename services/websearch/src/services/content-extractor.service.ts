import { Effect } from "effect";
import { ContentExtraction } from "../types";
import { parseHTML, extractMainContent, removeScriptsAndStyles } from "../lib";

export class ContentExtractorService {
  extract(url: string): Effect.Effect<ContentExtraction, Error> {
    return Effect.gen(this, function* () {
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

      const title = cleaned("title").first().text().trim() || "";

      const extractionTime = Date.now() - startTime;

      return {
        url,
        title,
        content,
        wordCount: content.split(/\s+/).length,
        extractionTime,
      };
    });
  }

  extractBatch(urls: string[]): Effect.Effect<ContentExtraction[], Error> {
    return Effect.all(urls.map((url) => this.extract(url)), {
      concurrency: 3,
    });
  }
}
