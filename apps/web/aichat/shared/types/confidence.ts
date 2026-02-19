export interface ConfidenceIndicator {
  messageId: string;
  level: 'high' | 'medium' | 'low' | 'uncertain';
  score: number;
  factors: ConfidenceFactor[];
  explanation?: string;
}

export interface ConfidenceFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface ConfidenceSettings {
  enabled: boolean;
  showScore: boolean;
  showExplanation: boolean;
  threshold: number;
  highlightUncertain: boolean;
}
