import type { BoundingBox } from './agent';

export type AgentStatus = 'Idle' | 'Running' | 'Paused' | 'Stopped' | 'Error';

export interface LiveAgentState {
  status: AgentStatus;
  currentAction: string; // Human-readable description of the current action
  screenshotUrl: string; // URL to a real-time screenshot of the agent's view
  targetElementBounds?: BoundingBox; // Optional bounds for highlighting the current element
}
