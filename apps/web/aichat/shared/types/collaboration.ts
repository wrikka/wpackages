export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  lastSeen: Date | string;
}

export interface CollaborationSession {
  id: string;
  sessionId: string;
  collaborators: Collaborator[];
  isActive: boolean;
  createdAt: Date | string;
}

export interface AwarenessState {
  user: Collaborator;
  currentMessageId?: string;
  isTyping: boolean;
  viewport: { x: number; y: number; zoom: number };
}
