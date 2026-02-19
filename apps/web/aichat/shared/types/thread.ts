export interface ThreadBranch {
  id: string;
  parentId: string | null;
  sessionId: string;
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date | string;
  children: ThreadBranch[];
  isActive: boolean;
}

export interface ThreadTree {
  root: ThreadBranch;
  branches: ThreadBranch[];
  activePath: string[];
}

export interface MessageVersion {
  id: string;
  messageId: string;
  content: string;
  model: string;
  createdAt: Date | string;
  rating?: 'up' | 'down' | null;
}
