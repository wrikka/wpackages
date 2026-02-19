export interface AgentActionDetails {
  type: 'Click' | 'Type' | 'Navigate' | 'Scroll' | 'Wait' | 'Custom';
  details: string; // Human-readable summary
  params?: Record<string, any>; // Technical parameters
}

export interface ActionHistoryItem {
  id: string;
  timestamp: number;
  action: AgentActionDetails;
  status: 'executed' | 'undone' | 'failed';
  workflowId?: string; // Optional: link to the workflow that ran this action
}
