export interface SearchFilters {
  dateRange?: { from?: Date; to?: Date };
  models?: string[];
  agents?: string[];
  folders?: string[];
  hasAttachments?: boolean;
  messageType?: 'user' | 'assistant' | 'both';
}

export interface SearchResult {
  id: string;
  type: 'session' | 'message';
  title?: string;
  content: string;
  sessionId: string;
  messageId?: string;
  highlightedContent: string;
  createdAt: Date | string;
  relevanceScore: number;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'date' | 'tokens';
  sortOrder: 'asc' | 'desc';
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  createdAt: Date | string;
}
