export type TriggerType = 'schedule' | 'event';

export interface Trigger {
  id: string;
  name: string;
  type: TriggerType;
  description: string; // Human-readable summary of the trigger condition
  workflowId: string;
  workflowName: string; // For display purposes
  enabled: boolean;
  config?: Record<string, any>; // For cron strings, event paths, etc.
}
