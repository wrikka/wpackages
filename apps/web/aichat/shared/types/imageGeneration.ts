export interface ImageGenerationRequest {
  id: string;
  sessionId: string;
  messageId: string;
  prompt: string;
  negativePrompt?: string;
  model: 'dall-e-3' | 'dall-e-2' | 'stable-diffusion';
  size: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
  quality: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  resultUrls: string[];
  error?: string;
  createdAt: Date | string;
  completedAt?: Date | string;
}

export interface ImageGenerationPanel {
  isOpen: boolean;
  defaultModel: string;
  recentPrompts: string[];
}
