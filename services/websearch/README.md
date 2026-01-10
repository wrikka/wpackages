# @wpackages/websearch

AI-powered web search service with multi-engine support, caching, and advanced features.

## Features

- **Multi-Engine Support**: Google, Bing, DuckDuckGo, Brave
- **AI-Powered Features**: Query enhancement, result summarization, topic clustering
- **Content Extraction**: Extract full content from URLs
- **Smart Scoring**: Relevance-based result ranking
- **Deduplication**: Remove duplicate results across engines
- **Configurable**: Flexible configuration for engines, rate limits, caching

## Installation

```bash
bun add @wpackages/websearch
```

## Usage

```typescript
import { WebSearchApp } from "@wpackages/websearch";

const app = new WebSearchApp();

const result = await Effect.runPromise(
  app.search("TypeScript best practices")
);

console.log(result);
```

## Configuration

```typescript
import { createSearchConfig } from "@wpackages/websearch";

const config = createSearchConfig({
  engines: {
    google: {
      enabled: true,
      priority: 10,
    },
  },
  rateLimit: {
    maxRequestsPerMinute: 30,
  },
});

const app = new WebSearchApp(config);
```

## API

### WebSearchApp

- `search(query)` - Perform web search with AI enhancement
- `extractContent(url)` - Extract full content from a URL
- `extractContentBatch(urls)` - Extract content from multiple URLs
- `enhanceQuery(query)` - Enhance search query with AI
- `summarizeResults(results)` - Summarize search results
- `clusterResults(results)` - Cluster results by topic

## License

MIT
