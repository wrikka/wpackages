export type ChatMode =
  | 'auto'
  | 'chat'
  | 'research'
  | 'code'
  | 'agent'
  | 'image'
  | 'translate'
  | 'learn'
  | 'compare'
  | 'explain'
  | 'quiz'
  | 'summarize'
  | 'tutor'
  | 'writer'
  | 'copywriting'
  | 'analyze'
  | 'review'
  | 'organize'
  | 'present';

export type ChatScreenMode = Exclude<ChatMode, 'auto'>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export type ModelType = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'custom';
