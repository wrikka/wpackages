import { Effect } from "effect";
import { WebSearchApp } from "../../app";
import { SearchQuerySchema } from "../../types";

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: unknown) => Effect.Effect<unknown, Error>;
}

export class MCPServer {
  constructor(private app: WebSearchApp) {}

  getTools(): MCPTool[] {
    return [
      {
        name: "websearch_search",
        description: "Perform web search with AI-powered enhancement and analysis",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
            engines: {
              type: "array",
              items: {
                type: "string",
                enum: ["google", "bing", "duckduckgo", "brave", "all"],
              },
              description: "Search engines to use",
              default: ["all"],
            },
            numResults: {
              type: "number",
              description: "Number of results to return",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            language: {
              type: "string",
              description: "Language code",
              default: "en",
            },
            region: {
              type: "string",
              description: "Region code",
              default: "us",
            },
            timeRange: {
              type: "string",
              enum: ["any", "day", "week", "month", "year"],
              description: "Time range filter",
              default: "any",
            },
          },
          required: ["query"],
        },
        handler: (args: unknown) => {
          const parsed = SearchQuerySchema.parse(args);
          return this.app.search(parsed);
        },
      },
      {
        name: "websearch_extract",
        description: "Extract full content from a URL",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL to extract content from",
            },
          },
          required: ["url"],
        },
        handler: (args: unknown) => {
          const { url } = args as { url: string };
          return this.app.extractContent(url);
        },
      },
      {
        name: "websearch_extract_batch",
        description: "Extract content from multiple URLs",
        inputSchema: {
          type: "object",
          properties: {
            urls: {
              type: "array",
              items: {
                type: "string",
              },
              description: "URLs to extract content from",
            },
          },
          required: ["urls"],
        },
        handler: (args: unknown) => {
          const { urls } = args as { urls: string[] };
          return this.app.extractContentBatch(urls);
        },
      },
      {
        name: "websearch_enhance_query",
        description: "Enhance a search query with AI-powered suggestions",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Query to enhance",
            },
            engines: {
              type: "array",
              items: {
                type: "string",
                enum: ["google", "bing", "duckduckgo", "brave", "all"],
              },
              description: "Search engines to use",
              default: ["all"],
            },
            numResults: {
              type: "number",
              description: "Number of results to return",
              default: 10,
            },
            language: {
              type: "string",
              description: "Language code",
              default: "en",
            },
            region: {
              type: "string",
              description: "Region code",
              default: "us",
            },
          },
          required: ["query"],
        },
        handler: (args: unknown) => {
          const parsed = SearchQuerySchema.parse(args);
          return this.app.enhanceQuery(parsed);
        },
      },
      {
        name: "websearch_summarize",
        description: "Summarize search results with AI",
        inputSchema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              description: "Search results to summarize",
            },
            maxLength: {
              type: "number",
              description: "Maximum summary length",
              default: 1000,
            },
            maxKeyPoints: {
              type: "number",
              description: "Maximum number of key points",
              default: 5,
            },
          },
          required: ["results"],
        },
        handler: (args: unknown) => {
          const { results, maxLength, maxKeyPoints } = args as {
            results: unknown[];
            maxLength?: number;
            maxKeyPoints?: number;
          };
          return this.app.summarizeResults(results, maxLength, maxKeyPoints);
        },
      },
      {
        name: "websearch_cluster",
        description: "Cluster search results by topic",
        inputSchema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              description: "Search results to cluster",
            },
            maxTopics: {
              type: "number",
              description: "Maximum number of topics",
              default: 10,
            },
          },
          required: ["results"],
        },
        handler: (args: unknown) => {
          const { results, maxTopics } = args as {
            results: unknown[];
            maxTopics?: number;
          };
          return this.app.clusterResults(results, maxTopics);
        },
      },
    ];
  }

  async callTool(name: string, args: unknown): Promise<unknown> {
    const tools = this.getTools();
    const tool = tools.find((t) => t.name === name);

    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    return Effect.runPromise(tool.handler(args));
  }
}
