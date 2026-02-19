export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenElement {
  id: string;
  type: string;
  text?: string;
  boundingBox: BoundingBox;
  attributes?: Record<string, any>;
}

export interface Agent {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description?: string | null;
  systemPrompt?: string | null;
  createdAt: Date | string;
}

export interface AgentPromptHistory {
  id: string;
  agentId: string;
  systemPrompt?: string | null;
  createdAt: Date | string;
}
