export interface QuickAction {
  id: string;
  name: string;
  icon: string; // Icon name
  workflowId: string;
}

export interface MobileNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}
