export interface ModelComparison {
  id: string;
  prompt: string;
  responses: ModelResponse[];
  createdAt: Date | string;
}

export interface ModelResponse {
  id: string;
  comparisonId: string;
  model: string;
  provider: string;
  content: string;
  tokensUsed: number;
  latency: number;
  rating?: number;
  createdAt: Date | string;
}

export interface ComparisonPreset {
  id: string;
  name: string;
  models: string[];
  systemPrompt?: string;
}
