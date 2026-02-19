export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  structure: TemplateStep[];
  systemPrompt?: string;
  suggestedModels: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Date | string;
}

export interface TemplateStep {
  id: string;
  order: number;
  role: 'user' | 'assistant';
  content: string;
  placeholder?: string;
  isEditable: boolean;
}

export interface TemplateApplication {
  templateId: string;
  filledSteps: { stepId: string; content: string }[];
  sessionId?: string;
}
