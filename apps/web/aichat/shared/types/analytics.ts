export interface Metric {
  name: string;
  value: string;
  unit?: string;
  change: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

export interface AnalyticsData {
  keyMetrics: {
    timeSaved: Metric;
    tasksCompleted: Metric;
    errorsPrevented: Metric;
    successRate: Metric;
  };
  workflowUsage: ChartData;
  recentActivities: Activity[];
}

export interface ChatAnalytics {
  sessionId: string;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  startTime: Date | string;
  endTime?: Date | string;
  modelUsage: Record<string, number>;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  favoriteModels: { model: string; count: number }[];
  favoriteAgents: { agentId: string; count: number }[];
  dailyActivity: { date: string; messageCount: number }[];
  peakUsageHours: { hour: number; count: number }[];
}

export interface OrganizationAnalytics {
  organizationId: string;
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  averageSessionDuration: number;
  topUsers: { userId: string; messageCount: number }[];
  usageByDay: { date: string; tokens: number; cost: number }[];
}
