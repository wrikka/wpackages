export interface PinnedMessage {
  id: string;
  sessionId: string;
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  pinnedAt: Date | string;
  note?: string;
  order: number;
}

export interface PinnedMessagesPanel {
  isOpen: boolean;
  filterByRole?: 'user' | 'assistant' | 'all';
  sortBy: 'date' | 'manual';
  searchQuery: string;
}
