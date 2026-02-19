export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
