import type { Message } from './message';

export interface ChatSession {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  model: string;
  systemPrompt?: string | null;
  shareId?: string | null;
  folderId?: string | null;
  knowledgeBaseId?: string | null;
  agentId?: string | null;
  pinned?: boolean;
  tags?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  model?: string;
}

export interface ChatResponse {
  message: Message;
  sessionId: string;
}
