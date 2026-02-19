export interface ChatRequest {
  message: string;
  sessionId?: string;
  mode?: string;
  model?: string;
  systemPrompt?: string;
  attachments?: File[];
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  messageId: string;
  timestamp: Date | string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
  settings?: {
    mode: string;
    model: string;
    systemPrompt?: string;
  };
}
