import type { ScreenElement } from './agent';

export interface AgentAction {
  id: string;
  type: 'Click' | 'Type' | 'Scroll' | 'Wait';
  targetElementId?: string;
  params: Record<string, any>;
}

export interface CorrectionPayload {
  originalAction: AgentAction;
  newInstruction: string;
  newTargetElement?: ScreenElement;
}
