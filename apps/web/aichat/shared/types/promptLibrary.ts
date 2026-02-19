export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author?: string;
  rating: number;
  usageCount: number;
  isPublic: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

export interface UserPromptCollection {
  id: string;
  name: string;
  prompts: string[];
  createdAt: Date | string;
}
