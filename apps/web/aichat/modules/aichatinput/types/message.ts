export interface Attachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  timestamp: Date | string;
  metadata?: Record<string, any>;
}
