export interface AgentPerformance {
  agentId: string;
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  userSatisfaction: number;
  tokenUsage: number;
  costPerConversation: number;
  topUsedPrompts: { prompt: string; count: number }[];
  usageByDay: { date: string; count: number }[];
  errorRate: number;
}

export interface AgentMetricsDashboard {
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  selectedAgents: string[];
  comparisonMode: boolean;
  metrics: AgentPerformance[];
}

export interface AgentInsight {
  type: 'trend' | 'anomaly' | 'suggestion' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  relatedAgentId?: string;
  createdAt: Date | string;
}
