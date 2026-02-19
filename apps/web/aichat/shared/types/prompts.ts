export interface PromptRequest {
  id: string;
  question: string;
  options: string[];
  context?: string; // Additional context about the situation
}

export interface PromptResponse {
  requestId: string;
  selectedOption: string;
}
