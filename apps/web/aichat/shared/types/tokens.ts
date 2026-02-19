export interface TokenUsage {
  sessionId: string;
  messageId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
  createdAt: Date | string;
}

export interface SessionTokenStats {
  sessionId: string;
  totalTokens: number;
  totalCost: number;
  messageCount: number;
  averageTokensPerMessage: number;
}

export interface TokenBudget {
  dailyLimit: number;
  monthlyLimit: number;
  currentDaily: number;
  currentMonthly: number;
  alertsEnabled: boolean;
}
