export interface CodeExecution {
  id: string;
  chatSessionId?: string;
  messageId?: string;
  code: string;
  language: 'python' | 'javascript' | 'typescript';
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  createdAt: Date | string;
  completedAt?: Date | string;
}

export interface CodeExecutionPanel {
  isOpen: boolean;
  defaultLanguage: 'python' | 'javascript' | 'typescript';
  recentCode?: string[];
}
