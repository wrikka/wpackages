import type { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';

export interface Attachment {
  id: string;
  organizationId: string;
  userId: string;
  fileName: string;
  fileType: string;
  filePath: string; // This will be converted to a URL on the client
  fileSize: number;
  createdAt: Date | string;
}

export interface Message {
  id: string;
  chatSessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  timestamp: Date | string;
  parentMessageId?: string | null;
  tool_calls?: ChatCompletionMessageToolCall[];
  tool_results?: Record<string, unknown>;
  tool_call_id?: string;
  attachments?: Attachment[]; // Populated from a join
  chatSession?: { // Populated from a join
    title: string;
  };
}

export interface MessageComment {
  id: string;
  messageId: string;
  userId: string;
  content: string;
  createdAt: Date | string;
}
