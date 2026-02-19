export interface CommunityWorkflowAction {
  type: string;
  // In a real scenario, this would contain detailed parameters
}

export interface CommunityWorkflow {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  actions: CommunityWorkflowAction[];
}
