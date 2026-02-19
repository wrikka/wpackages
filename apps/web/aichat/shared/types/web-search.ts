export interface WebSearchQuery {
  id: string;
  chatSessionId: string;
  messageId?: string;
  query: string;
  results?: any;
  citations?: any[];
  createdAt: Date | string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
}

export interface WebSearchCitation {
  url: string;
  title: string;
  snippet?: string;
}
